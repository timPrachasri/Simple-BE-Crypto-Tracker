import { TokenEntity } from '~/domain/entities/token'
import {
  WalletHistoryEntities,
  WalletHistoryEntity,
} from '~/domain/entities/wallet-history'
import { IPrismaClient } from '~/infra/db/prisma/interfaces'
import { UniqueEntityID } from '~/shared/domain'

import {
  IFindWalletHistoryQuery,
  IWalletHistoryRepository,
} from '../../interfaces'

export class PrismaWalletHistoryRepository implements IWalletHistoryRepository {
  protected _db: IPrismaClient
  constructor(prisma: IPrismaClient) {
    this._db = prisma
  }

  async createOne(entity: WalletHistoryEntity): Promise<WalletHistoryEntity> {
    const resp = await this._db.walletHistory.create({
      data: {
        datetime: entity.datetime,
        amount: entity.amount.amount,
        Token: {
          connect: {
            id: Number(entity.token.id.toValue()),
          },
        },
      },
    })
    return WalletHistoryEntity.create(
      {
        datetime: resp.datetime,
        amount: resp.amount,
        token: TokenEntity.create(
          {
            name: entity.token.name,
            symbol: entity.token.symbol,
            decimals: entity.token.decimals,
          },
          entity.tokenId,
        ),
        createdAt: resp.createdAt,
      },
      new UniqueEntityID(resp.id),
    )
  }

  async findMany(
    query: IFindWalletHistoryQuery,
  ): Promise<WalletHistoryEntities> {
    const resp = await this._db.walletHistory.findMany({
      where: {
        ...query.where,
      },
      orderBy: {
        ...query.order,
      },
      include: {
        Token: true,
      },
    })
    return WalletHistoryEntities.create(
      resp.map((item) => {
        return WalletHistoryEntity.create(
          {
            datetime: item.datetime,
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
          },
          new UniqueEntityID(item.id),
        )
      }),
    )
  }
}
