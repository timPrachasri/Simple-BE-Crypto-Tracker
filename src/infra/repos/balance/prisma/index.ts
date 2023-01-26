import { Option, fromNullable, map } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function'

import { CurrentBalanceEntity } from '~/domain/entities/current-balance'
import { TokenEntity } from '~/domain/entities/token'
import { IPrismaClient } from '~/infra/db/prisma/interfaces'
import { UniqueEntityID } from '~/shared/domain'

import {
  ICurrentBalanceQuery,
  ICurrentBalanceRepository,
} from '../../interfaces'

export class PrismaCurrentBalanceRepository
  implements ICurrentBalanceRepository
{
  protected _db: IPrismaClient
  constructor(prisma: IPrismaClient) {
    this._db = prisma
  }

  async findOne(
    query: ICurrentBalanceQuery,
  ): Promise<Option<CurrentBalanceEntity>> {
    const resp = await this._db.currentBalance.findFirst({
      where: {
        ...query.where,
      },
      include: {
        Token: true,
      },
    })
    return pipe(
      fromNullable(resp),
      map((item) =>
        CurrentBalanceEntity.create(
          {
            amount: item.amount,
            token: TokenEntity.create(
              {
                name: item.Token.name,
                symbol: item.Token.symbol,
                decimals: item.Token.decimals,
              },
              new UniqueEntityID(item.Token.id),
            ),
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          },
          new UniqueEntityID(item.id),
        ),
      ),
    )
  }

  async createOne(entity: CurrentBalanceEntity): Promise<CurrentBalanceEntity> {
    const resp = await this._db.currentBalance.create({
      data: {
        amount: entity.amount.amount,
        Token: {
          connect: {
            id: Number(entity.token.id.toValue()),
          },
        },
      },
    })
    return CurrentBalanceEntity.create(
      {
        amount: resp.amount,
        token: entity.token,
        createdAt: resp.createdAt,
        updatedAt: resp.updatedAt,
      },
      new UniqueEntityID(resp.id),
    )
  }

  async updateOne(entity: CurrentBalanceEntity): Promise<CurrentBalanceEntity> {
    const resp = await this._db.currentBalance.update({
      where: {
        id: Number(entity.id.toValue()),
      },
      data: {
        amount: entity.amount.amount,
      },
    })
    return CurrentBalanceEntity.create(
      {
        amount: resp.amount,
        token: entity.token,
        createdAt: resp.createdAt,
        updatedAt: resp.updatedAt,
      },
      new UniqueEntityID(resp.id),
    )
  }
}
