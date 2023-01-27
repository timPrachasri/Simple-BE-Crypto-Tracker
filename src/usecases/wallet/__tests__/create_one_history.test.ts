import { isLeft, isRight, left, right } from 'fp-ts/lib/Either'
import { none, some } from 'fp-ts/lib/Option'
import { DateTime } from 'luxon'

import {
  ICreateWalletHistoryInputDTO,
  ICreateWalletHistoryOutputDTO,
} from '~/domain/dtos'
import { CurrentBalanceEntity } from '~/domain/entities/current-balance'
import { TokenEntity } from '~/domain/entities/token'
import {
  WalletHistoryEntities,
  WalletHistoryEntity,
} from '~/domain/entities/wallet-history'
import { Amount } from '~/domain/value-objects'
import {
  ICurrentBalanceRepository,
  ITokenRepository,
  ITransactionAdaptor,
  IWalletHistoryRepository,
} from '~/infra/repos/interfaces'
import { BadRequest, InternalServerError, Result } from '~/shared/core'
import { UniqueEntityID } from '~/shared/domain'
import { formatJSDateToISO } from '~/utils'

import { CreateOneWalletHistoryUsecase } from '../create_one_history'

interface IRepositories {
  currentBalanceRepository: ICurrentBalanceRepository
  walletHistoryRepository: IWalletHistoryRepository
  tokenRepository: ITokenRepository
  transactionAdaptor: ITransactionAdaptor
}

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}))

describe('CreateOneWalletHistoryUsecase', () => {
  let usecase: CreateOneWalletHistoryUsecase
  let input: ICreateWalletHistoryInputDTO
  let repositories: IRepositories
  const BTC = new TokenEntity({
    name: 'BTC',
    symbol: 'BTC',
    decimals: 8,
  })
  beforeEach(() => {
    // Mock repositories with correct return type first
    const defaultDateTime = DateTime.utc().toISO()
    repositories = {
      currentBalanceRepository: {
        findOne: jest.fn(() => Promise.resolve(none)),
        updateOne: jest.fn(() =>
          Promise.resolve(
            new CurrentBalanceEntity({
              amount: BigInt(0),
              token: BTC,
            }),
          ),
        ),
        createOne: jest.fn(() =>
          Promise.resolve(
            new CurrentBalanceEntity({
              amount: BigInt(0),
              token: BTC,
            }),
          ),
        ),
      },
      walletHistoryRepository: {
        createOne: jest.fn(() =>
          Promise.resolve(
            new WalletHistoryEntity({
              amount: BigInt(0),
              datetime: DateTime.fromISO(defaultDateTime, {
                zone: 'utc',
              }).toJSDate(),
              token: BTC,
            }),
          ),
        ),
        findMany: jest.fn(() => Promise.resolve(new WalletHistoryEntities([]))),
      },
      tokenRepository: {
        findOne: jest.fn(() => Promise.resolve(some(BTC))),
      },
      transactionAdaptor: {
        async createTransaction<T>(promise: () => Promise<T>): Promise<T> {
          return await promise()
        },
      },
    }

    usecase = new CreateOneWalletHistoryUsecase(
      repositories.walletHistoryRepository,
      repositories.currentBalanceRepository,
      repositories.tokenRepository,
      repositories.transactionAdaptor,
    )
  })

  describe('execute', () => {
    describe('When input validation fails', () => {
      test.each([
        { date: 'invalid date', amount: 0 },
        { date: '2022-13-14T14:48:01+04:00', amount: 0 },
        { date: '2022-12-14T14:48:01+04:00', amount: -1 },
      ])('should return an error using date %s', async ({ date, amount }) => {
        input = { datetime: date, amount }
        const result = await usecase.execute(input)
        expect(isLeft(result)).toBeTruthy()
      })
    })
    describe("When createdAt is't returned", () => {
      it('should throw an error', async () => {
        input = {
          amount: 10,
          datetime: '2022-10-14T14:48:01+04:00',
        }
        repositories.walletHistoryRepository.createOne = jest.fn(() =>
          Promise.resolve(
            new WalletHistoryEntity(
              {
                amount: BigInt(0),
                datetime: DateTime.fromISO(input.datetime, {
                  zone: 'utc',
                }).toJSDate(),
                token: BTC,
              },
              new UniqueEntityID(1),
            ),
          ),
        )

        const result = await usecase.execute(input)
        expect(
          repositories.walletHistoryRepository.createOne,
        ).toHaveBeenCalledWith(
          new WalletHistoryEntity({
            amount: Amount.fromNonZeroDecimalAmount(input.amount, BTC.decimals)
              .amount,
            datetime: DateTime.fromISO(input.datetime, {
              zone: 'utc',
            }).toJSDate(),
            token: BTC,
          }),
        )
        expect(isLeft(result)).toBeTruthy()
        expect(result).toEqual(
          left(
            Result.fail<InternalServerError>(
              new InternalServerError(
                'Internal Server Error',
                new Error('CreateOneItemUsecase::WalletHistory not created'),
              ),
            ),
          ),
        )
      })
    })

    describe("When amount decimal places is't valid", () => {
      it('should return an error', async () => {
        input = {
          amount: 10.999999999,
          datetime: '2022-10-14T14:48:01+04:00',
        }

        const result = await usecase.execute(input)
        expect(isLeft(result)).toBeTruthy()
        expect(result).toEqual(
          left(
            Result.fail<BadRequest>(
              new BadRequest(
                'Bad Request',
                new Error('CreateOneItemUsecase::Invalid Amount Decimals'),
              ),
            ),
          ),
        )
      })
    })

    describe('When transaction return error', () => {
      it('should return an error', async () => {
        repositories.transactionAdaptor.createTransaction = jest.fn(() => {
          throw new Error('Transaction error')
        })

        const result = await usecase.execute(input)
        expect(isLeft(result)).toBeTruthy()
        expect(result).toEqual(
          left(
            Result.fail<InternalServerError>(
              new InternalServerError(
                'Internal Server Error',
                new Error('Transaction error'),
              ),
            ),
          ),
        )
      })
    })

    describe('When token is not found', () => {
      it('should return an error if the token is not found', async () => {
        repositories.tokenRepository.findOne = jest.fn(() =>
          Promise.resolve(none),
        )
        const result = await usecase.execute(input)
        expect(isLeft(result)).toBeTruthy()
        expect(result).toEqual(
          left(
            Result.fail<InternalServerError>(
              new InternalServerError(
                'Internal Server Error',
                new Error('CreateOneItemUsecase::Token not found'),
              ),
            ),
          ),
        )
      })
    })

    describe('When createdAt is returned', () => {
      it('should create a new wallet history', async () => {
        input = {
          amount: 10.999999,
          datetime: '2022-10-14T14:48:01+04:00',
        }
        const expectedDatetime = DateTime.fromISO(input.datetime, {
          zone: 'utc',
        }).toJSDate()
        repositories.walletHistoryRepository.createOne = jest.fn(() =>
          Promise.resolve(
            new WalletHistoryEntity(
              {
                amount: Amount.fromNonZeroDecimalAmount(
                  input.amount,
                  BTC.decimals,
                ).amount,
                datetime: expectedDatetime,
                token: BTC,
                createdAt: expectedDatetime,
              },
              new UniqueEntityID(1),
            ),
          ),
        )
        repositories.currentBalanceRepository.createOne = jest.fn(() =>
          Promise.resolve(
            new CurrentBalanceEntity({
              amount: Amount.fromNonZeroDecimalAmount(
                input.amount,
                BTC.decimals,
              ).amount,
              token: BTC,
            }),
          ),
        )

        const result = await usecase.execute(input)
        expect(
          repositories.walletHistoryRepository.createOne,
        ).toHaveBeenCalledWith(
          new WalletHistoryEntity({
            amount: Amount.fromNonZeroDecimalAmount(input.amount, BTC.decimals)
              .amount,
            datetime: DateTime.fromISO(input.datetime, {
              zone: 'utc',
            }).toJSDate(),
            token: BTC,
          }),
        )
        expect(isRight(result)).toBeTruthy()
        expect(result).toEqual(
          right(
            Result.ok<ICreateWalletHistoryOutputDTO>({
              createdAt: formatJSDateToISO(expectedDatetime),
              inputAmount: input.amount,
              accumAmount: input.amount,
            }),
          ),
        )
      })
    })
  })
})
