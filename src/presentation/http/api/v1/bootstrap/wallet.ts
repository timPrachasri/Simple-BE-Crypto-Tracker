import { prisma } from '~/infra/connectors/prisma'
import { PrismaTransactionAdaptor } from '~/infra/db/prisma/adapter'
import { PrismaCurrentBalanceRepository } from '~/infra/repos/balance/prisma'
import { PrismaTokenRepository } from '~/infra/repos/token/prisma'
import { PrismaWalletHistoryRepository } from '~/infra/repos/wallet-history/prisma'
import {
  CreateOneWalletHistoryUsecase,
  GetCurrentWalletBalanceUsecase,
  GetWalletHistoriesUsecase,
} from '~/usecases/wallet'

import {
  CreateOneWalletHistoryHandler,
  GetCurrentWalletBalanceHandler,
  GetWalletHistoriesHandler,
} from '../wallet'

const walletHistoryRepository = new PrismaWalletHistoryRepository(prisma)
const currentBalanceRepository = new PrismaCurrentBalanceRepository(prisma)
const tokenRepository = new PrismaTokenRepository(prisma)
const transactionAdapter = new PrismaTransactionAdaptor()

const createOneWalletHistoryUsecase = new CreateOneWalletHistoryUsecase(
  walletHistoryRepository,
  currentBalanceRepository,
  tokenRepository,
  transactionAdapter,
)

const getWalletHistoriesUsecase = new GetWalletHistoriesUsecase(
  walletHistoryRepository,
  tokenRepository,
  transactionAdapter,
)

const getCurrentWalletBalanceUsecase = new GetCurrentWalletBalanceUsecase(
  walletHistoryRepository,
  currentBalanceRepository,
  tokenRepository,
  transactionAdapter,
)

export const createOneWalletHistoryHandler = new CreateOneWalletHistoryHandler(
  createOneWalletHistoryUsecase,
)
export const getWalletHistoriesHandler = new GetWalletHistoriesHandler(
  getWalletHistoriesUsecase,
)
export const getCurrentWalletBalanceHandler =
  new GetCurrentWalletBalanceHandler(getCurrentWalletBalanceUsecase)
