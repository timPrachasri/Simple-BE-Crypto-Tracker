import * as express from 'express'
import { Either, isRight, left } from 'fp-ts/lib/Either'

import {
  BaseError,
  InternalServerError,
  Result,
  defaultLogger,
  stdErrorLogger,
} from '~/shared/core'

type IHttpResponse =
  | {
      status: string
      data: Record<string, any>
    }
  | string

/* The BaseHandler class is an abstract class that defines the executeImpl method. The executeImpl
method is the implementation of the execute method. The execute method is the entry point of the
handler.

The execute method is responsible for parsing the request and calling the executeImpl method.

The executeImpl method is responsible for handling the request and returning the response.
*/
export abstract class BaseHandler {
  protected abstract executeImpl(
    req: express.Request,
    res: express.Response,
  ): Promise<void | any>

  public async execute(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      await this.executeImpl(req, res)
    } catch (err) {
      BaseHandler.parseResponse(
        res,
        left(
          Result.fail<InternalServerError>(
            new InternalServerError('Internal Server Error', err as Error),
          ),
        ),
      )
    }
  }

  public static jsonResponse(
    res: express.Response,
    code: number,
    message: IHttpResponse,
  ): any {
    return res.status(code).json(message)
  }

  /**
   * If the usecaseEither is a Right, then return a 200 OK with the data. If the usecaseEither is a
   * Left, then return a 400 Bad Request with the error message
   * @param res - express.Response
   * @param usecaseEither - Either<Result<BaseError>, Result<R>>
   * @returns Nothing.
   */
  public static parseResponse<T extends Record<string, any>>(
    res: express.Response,
    usecaseEither: Either<Result<BaseError>, Result<T>>,
  ): any {
    if (isRight(usecaseEither)) {
      const value = usecaseEither.right.getValue()
      defaultLogger.info('', { meta: value })

      return BaseHandler.jsonResponse(res, 200, {
        status: 'success',
        data: usecaseEither.right.getValue() as T,
      })
    }
    const err = usecaseEither.left.errorValue()

    defaultLogger.warn(`${err.message}-${err.reason}`)
    stdErrorLogger.error(err.maybeError)

    return BaseHandler.jsonResponse(res, err.code, {
      status: 'error',
      data: {
        message: err.message,
      },
    })
  }
}
