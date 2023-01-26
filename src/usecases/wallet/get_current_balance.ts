import { left, right } from 'fp-ts/lib/Either'
import { getOrElse, isNone, match } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function'
import { DateTime } from 'luxon'

import { TokenSymbol } from '~/constants'
import { IGetCurrentWalletBalanceOutput } from '~/domain/dtos'
import {
  ICurrentBalanceRepository,
  ITokenRepository,
  ITransactionAdaptor,
  IWalletHistoryRepository,
} from '~/infra/repos/interfaces'
import { InternalServerError, Result, UseCase } from '~/shared/core'
import { formatJSDateToISO } from '~/utils'

import { TResponse } from '../interface'

export class GetCurrentWalletBalanceUsecase
  implements UseCase<null, Promise<TResponse<IGetCurrentWalletBalanceOutput>>>
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

  public async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: null,
  ): Promise<TResponse<IGetCurrentWalletBalanceOutput>> {
    try {
      return await this._transactionAdapter.createTransaction<
        TResponse<IGetCurrentWalletBalanceOutput>
      >(async () => {
        const maybeToken = await this._tokenRepository.findOne({
          where: {
            symbol: TokenSymbol.BTC,
          },
        })
        if (isNone(maybeToken)) {
          throw new Error('GetCurrentWalletBalanceUsecase::Token not found')
        }
        const existingBalance = await this._currentBalanceRepository.findOne({
          where: {
            tokenId: Number(maybeToken.value.id),
          },
        })

        return pipe(
          existingBalance,
          match(
            () =>
              right(
                Result.ok<IGetCurrentWalletBalanceOutput>({
                  amount: 0,
                  updatedAt: formatJSDateToISO(DateTime.utc().toJSDate()),
                }),
              ),
            (unwrapBalance) =>
              right(
                Result.ok<IGetCurrentWalletBalanceOutput>({
                  amount: unwrapBalance.amount.nonZeroDecimalAmount,
                  updatedAt: formatJSDateToISO(
                    getOrElse(() => {
                      return DateTime.utc().toJSDate()
                    })(unwrapBalance.updatedAt),
                  ),
                }),
              ),
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
