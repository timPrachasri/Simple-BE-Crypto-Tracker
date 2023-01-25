interface IBaseError {
  message: string
}

export abstract class BaseError implements IBaseError {
  public readonly message: string
  public readonly code: number
  public readonly reason: string
  public readonly maybeError: Error | null | undefined

  constructor(message: string, code: number, reason?: string, err?: Error) {
    this.message = `${message}${reason ? ':: ' + reason : ''}`
    this.code = code
    this.reason = reason ?? ''
    this.maybeError = err
  }
}

export class InternalServerError extends BaseError {
  constructor(reason: string, err?: Error) {
    super('Internal Server Error', 500, reason, err)
  }
}

export class ServiceUnavailable extends BaseError {
  constructor(reason: string, err?: Error) {
    super('Service Unavailable', 503, reason, err)
  }
}

export class BadRequest extends BaseError {
  constructor(reason: string, err?: Error) {
    super('Bad Request', 400, reason, err)
  }
}
