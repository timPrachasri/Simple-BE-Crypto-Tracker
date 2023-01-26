import express from 'express'
import { right } from 'fp-ts/lib/Either'

import {
  createOneWalletHistoryHandler,
  getCurrentWalletBalanceHandler,
  getWalletHistoriesHandler,
} from '~/presentation/http/api/v1'
import { Result } from '~/shared/core'

import { BaseHandler } from '../..'

const v1Router = express.Router()

v1Router.get('/healthz', (req, res) => {
  return BaseHandler.parseResponse<any>(res, right(Result.ok()))
})

v1Router.post('/wallet-histories.create', async (req, res) => {
  await createOneWalletHistoryHandler.execute(req, res)
})

v1Router.get('/wallet-histories', async (req, res) => {
  await getWalletHistoriesHandler.execute(req, res)
})

v1Router.get('/current-balance', async (req, res) => {
  await getCurrentWalletBalanceHandler.execute(req, res)
})

export { v1Router }
