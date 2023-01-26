import * as express from 'express'

import {
  IGetWalletHistoriesInputDTO,
  IGetWalletHistoriesOutputDTO,
} from '~/domain/dtos'
import { UseCase } from '~/shared/core/usecase'
import { BaseHandler } from '~/shared/infra/http'
import { TResponse } from '~/usecases/interface'

export class GetWalletHistoriesHandler extends BaseHandler {
  private _useCase: UseCase<
    IGetWalletHistoriesInputDTO,
    Promise<TResponse<IGetWalletHistoriesOutputDTO>>
  >

  constructor(
    useCase: UseCase<
      IGetWalletHistoriesInputDTO,
      Promise<TResponse<IGetWalletHistoriesOutputDTO>>
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
      req.body as IGetWalletHistoriesInputDTO,
    )
    return BaseHandler.parseResponse<IGetWalletHistoriesOutputDTO>(res, result)
  }
}
