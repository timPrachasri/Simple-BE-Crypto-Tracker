import * as express from 'express'

import {
  ICreateWalletHistoryInputDTO,
  ICreateWalletHistoryOutputDTO,
} from '~/domain/dtos'
import { UseCase } from '~/shared/core/usecase'
import { BaseHandler } from '~/shared/infra/http'
import { TResponse } from '~/usecases/interface'

export class CreateOneWalletHistoryHandler extends BaseHandler {
  private _useCase: UseCase<
    ICreateWalletHistoryInputDTO,
    Promise<TResponse<ICreateWalletHistoryOutputDTO>>
  >

  constructor(
    useCase: UseCase<
      ICreateWalletHistoryInputDTO,
      Promise<TResponse<ICreateWalletHistoryOutputDTO>>
    >,
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
    const result = await this._useCase.execute(
      req.body as ICreateWalletHistoryInputDTO,
    )
    return BaseHandler.parseResponse<ICreateWalletHistoryOutputDTO>(res, result)
  }
}
