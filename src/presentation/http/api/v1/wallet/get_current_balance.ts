import * as express from 'express'

import { IGetCurrentWalletBalanceOutput } from '~/domain/dtos'
import { UseCase } from '~/shared/core/usecase'
import { BaseHandler } from '~/shared/infra/http'
import { TResponse } from '~/usecases/interface'

export class GetCurrentWalletBalanceHandler extends BaseHandler {
  private _useCase: UseCase<
    null,
    Promise<TResponse<IGetCurrentWalletBalanceOutput>>
  >

  constructor(
    useCase: UseCase<null, Promise<TResponse<IGetCurrentWalletBalanceOutput>>>,
  ) {
    super()
    this._useCase = useCase
  }

  /**
   * It calls the execute method of the use case and returns the result.
   * @param req - express.Request
   * @param res - express.Response - The response object that the controller will use to send data back
   * to the client.
   * @returns The result of the use case execution.
   */
  async executeImpl(req: express.Request, res: express.Response): Promise<any> {
    const result = await this._useCase.execute(null)
    return BaseHandler.parseResponse<IGetCurrentWalletBalanceOutput>(
      res,
      result,
    )
  }
}
