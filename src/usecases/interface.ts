import { Either } from 'fp-ts/lib/Either'

import { BaseError, Result } from '~/shared/core'

export type TResponse<T = string> = Either<Result<BaseError>, Result<T>>
