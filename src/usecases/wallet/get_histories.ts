import { Either, isLeft, left, right } from 'fp-ts/lib/Either'
import Joi from 'joi'
import { DateTime } from 'luxon'

import {
  IGetWalletHistoriesInputDTO,
  IGetWalletHistoriesOutput,
  IGetWalletHistoriesOutputDTO,
} from '~/domain/dtos/wallet_balance'
import {
  WalletHistoryEntities,
  WalletHistoryEntity,
} from '~/domain/entities/wallet-history'
import { Amount } from '~/domain/value-objects'
import {
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

import { TResponse } from '../interface'

export class GetWalletHistoriesUsecase
  implements
    UseCase<
      IGetWalletHistoriesInputDTO,
      Promise<TResponse<IGetWalletHistoriesOutputDTO>>
    >
{
  protected _walletHistoryRepository: IWalletHistoryRepository
  protected _tokenRepository: ITokenRepository
  protected _transactionAdapter: ITransactionAdaptor

  constructor(
    walletHistoryRepository: IWalletHistoryRepository,
    tokenRepository: ITokenRepository,
    transactionAdapter: ITransactionAdaptor,
  ) {
    this._walletHistoryRepository = walletHistoryRepository
    this._tokenRepository = tokenRepository
    this._transactionAdapter = transactionAdapter
  }

  private validateInput(
    input: IGetWalletHistoriesInputDTO,
  ): Either<Error, IGetWalletHistoriesInputDTO> {
    const schema = Joi.object({
      startDatetime: Joi.date().iso().less(Joi.ref('endDatetime')).required(),
      endDatetime: Joi.date().iso().required(),
    })
    const result = schema.validate(input)
    if (result.error) {
      defaultLogger.error(result.error)
      return left(result.error)
    }
    return right(input)
  }

  private buildResponse(histories: WalletHistoryEntities) {
    const sortDatetimeASCFn = (
      a: IGetWalletHistoriesOutput,
      b: IGetWalletHistoriesOutput,
    ) => {
      if (DateTime.fromISO(a.datetime) < DateTime.fromISO(b.datetime)) {
        return -1
      }
      if (DateTime.fromISO(a.datetime) > DateTime.fromISO(b.datetime)) {
        return 1
      }
      return 0
    }

    const returner = Object.entries(histories.groupByHour()).map(
      (hourHistories: [string, Array<WalletHistoryEntity>]) => {
        const [datetime, histories] = hourHistories
        return {
          datetime: datetime,
          amount: histories.reduce<Amount>((accum, history) => {
            return history.amount.add(accum)
          }, Amount.zero()).nonZeroDecimalAmount,
        } as IGetWalletHistoriesOutput
      },
    )
    returner.sort(sortDatetimeASCFn)
    return returner
  }

  public async execute(
    request: IGetWalletHistoriesInputDTO,
  ): Promise<TResponse<IGetWalletHistoriesOutputDTO>> {
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

      return await this._transactionAdapter.createTransaction<
        TResponse<IGetWalletHistoriesOutputDTO>
      >(async () => {
        const histories = await this._walletHistoryRepository.findMany({
          where: {
            datetime: {
              gte: DateTime.fromISO(validatedInput.startDatetime, {
                zone: 'utc',
              }).toJSDate(),
              lte: DateTime.fromISO(validatedInput.endDatetime, {
                zone: 'utc',
              }).toJSDate(),
            },
          },
        })

        return right(
          Result.ok<IGetWalletHistoriesOutputDTO>(
            this.buildResponse(histories),
          ),
        )
      })
    } catch (error) {
      return left(
        Result.fail<InternalServerError>(
          new InternalServerError('Internal Server Error', error as Error),
        ),
      )
    }
  }
}
