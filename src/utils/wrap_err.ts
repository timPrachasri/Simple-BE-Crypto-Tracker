import { Either, left, right } from 'fp-ts/lib/Either'

/**
 * Wrap a promise in an either monad
 * @param p - Promise<T>
 * @returns Either<any, T | undefined>
 */
export async function wrapErr<T>(
  p: Promise<T>,
): Promise<Either<any, T | undefined>> {
  try {
    const result = await p
    return right(result)
  } catch (err) {
    return left(err)
  }
}

export function wrapSyncErr<T>(p: () => T): Either<any, T | undefined> {
  try {
    const result = p()
    return right(result)
  } catch (err) {
    return left(err)
  }
}
