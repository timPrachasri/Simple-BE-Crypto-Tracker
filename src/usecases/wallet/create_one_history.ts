import { parseUnits } from '@ethersproject/units'

import { Either, isLeft, left, right } from 'fp-ts/lib/Either'
import { isNone, isSome } from 'fp-ts/lib/Option'
import Joi from 'joi'
import { DateTime } from 'luxon'

import { TokenSymbol } from '~/constants'
import {
  ICreateWalletHistoryInputDTO,
  ICreateWalletHistoryOutputDTO,
} from '~/domain/dtos/wallet_balance'
import { CurrentBalanceEntity } from '~/domain/entities/current-balance'
import { WalletHistoryEntity } from '~/domain/entities/wallet-history'
import { Amount } from '~/domain/value-objects'
import {
  ICurrentBalanceRepository,
  ITokenRepository,
  ITransactionAdaptor,
  IWalletHistoryRepository,
} from '~/infra/repos/interfaces'
import {
  BadRequest,
  InternalServerError,
  Result,
  UseCase,
  defaultLogger,
} from '~/shared/core'
import { formatJSDateToISO, wrapSyncErr } from '~/utils'

import { TResponse } from '../interface'

export class CreateOneWalletHistoryUsecase
  implements
    UseCase<
      ICreateWalletHistoryInputDTO,
      Promise<TResponse<ICreateWalletHistoryOutputDTO>>
    >
{
  protected _walletHistoryRepository: IWalletHistoryRepository
  protected _currentBalanceRepository: ICurrentBalanceRepository
  protected _tokenRepository: ITokenRepository
  protected _transactionAdapter: ITransactionAdaptor

  constructor(
    walletHistoryRepository: IWalletHistoryRepository,
    currentBalanceRepository: ICurrentBalanceRepository,
    tokenRepository: ITokenRepository,
    transactionAdapter: ITransactionAdaptor,
  ) {
    this._walletHistoryRepository = walletHistoryRepository
    this._currentBalanceRepository = currentBalanceRepository
    this._tokenRepository = tokenRepository
    this._transactionAdapter = transactionAdapter
  }

  private validateInput(
    input: ICreateWalletHistoryInputDTO,
  ): Either<Error, ICreateWalletHistoryInputDTO> {
    const schema = Joi.object({
      datetime: Joi.date().iso().required(),
      amount: Joi.number().required(),
    })
    const result = schema.validate(input)
    if (result.error) {
      defaultLogger.error(result.error)
      return left(new Error(result.error.message))
    }
    return right(input)
  }

  private validateDecimal(
    amount: number,
    decimals: number,
  ): Either<any, void | undefined> {
    return wrapSyncErr(() => {
      parseUnits(amount.toString(), decimals)
    })
  }

  public async execute(
    request: ICreateWalletHistoryInputDTO,
  ): Promise<TResponse<ICreateWalletHistoryOutputDTO>> {
    try {
      const inputValidation = this.validateInput(request)
      if (isLeft(inputValidation)) {
        return left(
          Result.fail<InternalServerError>(
            new BadRequest('Bad Request', inputValidation.left),
          ),
        )
      }
      const validatedInput = inputValidation.right

      const res = await this._transactionAdapter.createTransaction<
        TResponse<ICreateWalletHistoryOutputDTO>
      >(async () => {
        const maybeToken = await this._tokenRepository.findOne({
          where: {
            symbol: TokenSymbol.BTC,
          },
        })
        if (isNone(maybeToken)) {
          throw new Error('CreateOneItemUsecase::Token not found')
        }

        const validateDecimalResult = this.validateDecimal(
          validatedInput.amount,
          maybeToken.value.decimals,
        )
        if (isLeft(validateDecimalResult)) {
          throw new Error('CreateOneItemUsecase::Invalid Amount Decimals')
        }

        const inputAmount = Amount.fromNonZeroDecimalAmount(
          validatedInput.amount,
          maybeToken.value.decimals,
        )
        const createdWalletHistory =
          await this._walletHistoryRepository.createOne(
            WalletHistoryEntity.create({
              datetime: DateTime.fromISO(validatedInput.datetime, {
                zone: 'utc',
              }).toJSDate(),
              amount: inputAmount.amount,
              token: maybeToken.value,
            }),
          )

        if (isNone(createdWalletHistory.createdAt)) {
          throw new Error('CreateOneItemUsecase::WalletHistory not created')
        }
        const existingBalance = await this._currentBalanceRepository.findOne({
          where: {
            tokenId: Number(maybeToken.value.id),
          },
        })
        const upsertedBalance = await (async () => {
          if (!isSome(existingBalance)) {
            return await this._currentBalanceRepository.createOne(
              CurrentBalanceEntity.create({
                amount: inputAmount.amount,
                token: maybeToken.value,
              }),
            )
          }

          return await this._currentBalanceRepository.updateOne(
            existingBalance.value.increaseAmount(inputAmount),
          )
        })()
        return right(
          Result.ok<ICreateWalletHistoryOutputDTO>({
            createdAt: formatJSDateToISO(createdWalletHistory.createdAt.value),
            inputAmount: createdWalletHistory.amount.nonZeroDecimalAmount,
            accumAmount: upsertedBalance.amount.nonZeroDecimalAmount,
          }),
        )
      })

      return res
    } catch (error) {
      return left(
        Result.fail<InternalServerError>(
          new InternalServerError('Internal Server Error', error as Error),
        ),
      )
    }
  }
}
