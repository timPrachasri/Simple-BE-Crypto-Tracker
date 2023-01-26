import { Prisma, PrismaClient } from '@prisma/client'

import { Option } from 'fp-ts/lib/Option'

import { CurrentBalanceEntity } from '~/domain/entities/current-balance'
import { TokenEntity } from '~/domain/entities/token'
import {
  WalletHistoryEntities,
  WalletHistoryEntity,
} from '~/domain/entities/wallet-history'

/**
 * Query will be mostly based on prisma since the query object structure is complete, hence we create internal type to wrap the prisma type for the future improve
 */

export type IOrderBy = 'asc' | 'desc'

export type IEnumerable<T> = T | T[]

export type IDateTimeFilter = Prisma.DateTimeFilter

export type IDateTimeNullableFilter = Prisma.DateTimeNullableFilter

export type IIntFilter = Prisma.IntFilter

export type IBigIntFilter = Prisma.BigIntFilter

export type IStringFilter = Prisma.StringFilter

export interface ITransactionAdaptor {
  createTransaction<T>(promise: () => Promise<T>): Promise<T>
}

export interface ITransaction {
  commit(): Promise<void>
  rollback(): Promise<void>
}

export interface IFindWalletHistoryOrder {
  id?: IOrderBy | undefined
  datetime?: IOrderBy | undefined
  amount?: IOrderBy | undefined
  tokenId?: IOrderBy | undefined
  createdAt?: IOrderBy | undefined
}

export interface IFindWalletHistoryWhere {
  AND?: IEnumerable<IFindWalletHistoryWhere>
  OR?: IEnumerable<IFindWalletHistoryWhere>
  NOT?: IEnumerable<IFindWalletHistoryWhere>
  id?: IIntFilter | number
  datetime?: IDateTimeFilter | Date | string
  amount?: IBigIntFilter | bigint | number
  tokenId?: IIntFilter | number
  createdAt?: IDateTimeNullableFilter | Date | string | null
}

export interface IFindWalletHistoryQuery {
  order?: IFindWalletHistoryOrder
  where?: IFindWalletHistoryWhere
}

export interface IWalletHistoryRepository {
  createOne(entity: WalletHistoryEntity): Promise<WalletHistoryEntity>
  findMany(query: IFindWalletHistoryQuery): Promise<WalletHistoryEntities>
}

export interface IFindWalletHistoryOrder {
  id?: IOrderBy | undefined
  datetime?: IOrderBy | undefined
  amount?: IOrderBy | undefined
  tokenId?: IOrderBy | undefined
  createdAt?: IOrderBy | undefined
}

export interface IFindWalletHistoryWhere {
  AND?: IEnumerable<IFindWalletHistoryWhere>
  OR?: IEnumerable<IFindWalletHistoryWhere>
  NOT?: IEnumerable<IFindWalletHistoryWhere>
  id?: IIntFilter | number
  datetime?: IDateTimeFilter | Date | string
  amount?: IBigIntFilter | bigint | number
  tokenId?: IIntFilter | number
  createdAt?: IDateTimeNullableFilter | Date | string | null
}

export interface IFindWalletHistoryQuery {
  order?: IFindWalletHistoryOrder
  where?: IFindWalletHistoryWhere
}

export interface IFindOneTokenWhere {
  AND?: IEnumerable<IFindOneTokenWhere>
  OR?: IEnumerable<IFindOneTokenWhere>
  NOT?: IEnumerable<IFindOneTokenWhere>
  id?: IIntFilter | number
  name?: IStringFilter | string
  symbol?: IStringFilter | string
  decimals?: IIntFilter | number
  createdAt?: IDateTimeFilter | Date | string
}

export interface IFindOneTokenQuery {
  where?: IFindOneTokenWhere
}

export interface ITokenRepository {
  findOne(query: IFindOneTokenQuery): Promise<Option<TokenEntity>>
}

export interface ICurrentBalanceWhere {
  AND?: IEnumerable<ICurrentBalanceWhere>
  OR?: IEnumerable<ICurrentBalanceWhere>
  NOT?: IEnumerable<ICurrentBalanceWhere>
  id?: IIntFilter | number
  amount?: IBigIntFilter | bigint | number
  tokenId?: IIntFilter | number
}

export interface ICurrentBalanceQuery {
  where?: ICurrentBalanceWhere
}

export interface ICurrentBalanceRepository {
  findOne(query: ICurrentBalanceQuery): Promise<Option<CurrentBalanceEntity>>
  createOne(entity: CurrentBalanceEntity): Promise<CurrentBalanceEntity>
  updateOne(entity: CurrentBalanceEntity): Promise<CurrentBalanceEntity>
}
