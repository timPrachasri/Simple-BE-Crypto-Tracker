import { Option, fromNullable, map } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function'

import { TokenEntity } from '~/domain/entities/token'
import { IPrismaClient } from '~/infra/db/prisma/interfaces'
import { UniqueEntityID } from '~/shared/domain'

import { IFindOneTokenQuery, ITokenRepository } from '../../interfaces'

export class PrismaTokenRepository implements ITokenRepository {
  protected _db: IPrismaClient
  constructor(prisma: IPrismaClient) {
    this._db = prisma
  }

  async findOne(query: IFindOneTokenQuery): Promise<Option<TokenEntity>> {
    const resp = await this._db.token.findFirst({
      where: {
        ...query.where,
      },
    })
    return pipe(
      fromNullable(resp),
      map((item) =>
        TokenEntity.create(
          {
            name: item.name,
            symbol: item.symbol,
            decimals: item.decimals,
          },
          new UniqueEntityID(item.id),
        ),
      ),
    )
  }
}
