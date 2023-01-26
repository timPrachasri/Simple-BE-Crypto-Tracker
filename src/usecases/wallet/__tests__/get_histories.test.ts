import { isLeft } from 'fp-ts/lib/Either'
import { none, some } from 'fp-ts/lib/Option'
import { DateTime } from 'luxon'

import {
  ICreateWalletHistoryInputDTO,
  IGetWalletHistoriesInputDTO,
} from '~/domain/dtos'
import { CurrentBalanceEntity } from '~/domain/entities/current-balance'
import { TokenEntity } from '~/domain/entities/token'
import {
  WalletHistoryEntities,
  WalletHistoryEntity,
} from '~/domain/entities/wallet-history'
import {
  ICurrentBalanceRepository,
  ITokenRepository,
  ITransactionAdaptor,
  IWalletHistoryRepository,
} from '~/infra/repos/interfaces'

import { GetWalletHistoriesUsecase } from '../get_histories'

interface IRepositories {
  walletHistoryRepository: IWalletHistoryRepository
  tokenRepository: ITokenRepository
  transactionAdaptor: ITransactionAdaptor
}

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}))

describe('GetWalletHistoriesUsecase', () => {
  let usecase: GetWalletHistoriesUsecase
  let input: IGetWalletHistoriesInputDTO
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

    usecase = new GetWalletHistoriesUsecase(
      repositories.walletHistoryRepository,
      repositories.tokenRepository,
      repositories.transactionAdaptor,
    )
  })

  describe('execute', () => {
    describe('When input validation fails with not iso format', () => {
      test.each([
        {
          startDatetime: 'invalid date',
          endDatetime: '2021-12-14T14:48:01+04:00',
        },
        {
          startDatetime: '2022-13-14T14:48:01+04:00',
          endDatetime: 'invalid date',
        },
        {
          startDatetime: '2022-13-14T14:48:01+04:00',
          endDatetime: '2022-12-14T14:48:01+04:00',
        },
        {
          startDatetime: '2022-12-14T14:48:01+04:00',
          endDatetime: '2022-13-14T14:48:01+04:00',
        },
      ])(
        'should return an error using date %s',
        async ({ startDatetime, endDatetime }) => {
          input = { startDatetime, endDatetime }
          const result = await usecase.execute(input)
          expect(isLeft(result)).toBeTruthy()
        },
      )
    })

    describe('When input validation fails with startDatetime >= endDatetime', () => {
      test.each([
        {
          startDatetime: '2022-12-14T14:48:01+04:00',
          endDatetime: '2022-12-14T14:48:01+04:00',
        },
        {
          startDatetime: '2022-12-14T14:48:01+04:00',
          endDatetime: '2022-12-13T14:48:01+04:00',
        },
      ])(
        'should return an error using date %s',
        async ({ startDatetime, endDatetime }) => {
          input = { startDatetime, endDatetime }
          const result = await usecase.execute(input)
          expect(isLeft(result)).toBeTruthy()
        },
      )
    })
  })
})
