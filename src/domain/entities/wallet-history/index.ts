import { Option, fromNullable } from 'fp-ts/lib/Option'
import { DateTime } from 'luxon'

import { Amount } from '~/domain/value-objects'
import { Entity } from '~/shared/domain'
import { UniqueEntityID } from '~/shared/domain'
import { formatJSDateToISO } from '~/utils'

import { TokenEntity } from '../token'
import { IWalletHistoryProps } from './interfaces'

export class WalletHistoryEntity extends Entity<IWalletHistoryProps> {
  protected _amount: Amount

  constructor(props: IWalletHistoryProps, id?: UniqueEntityID) {
    super(props, id)
    this._amount = new Amount({
      amount: props.amount,
      decimals: props.token.decimals,
    })
  }

  get id(): UniqueEntityID {
    return this._id
  }

  get datetime(): Date {
    return DateTime.fromJSDate(this.props.datetime, {
      zone: 'utc',
    }).toJSDate()
  }

  get amount(): Amount {
    return this._amount
  }

  get tokenId(): UniqueEntityID {
    return this.props.token.id
  }

  get token(): TokenEntity {
    return this.props.token
  }

  get createdAt(): Option<Date> {
    return fromNullable(
      this.props.createdAt
        ? DateTime.fromJSDate(this.props.createdAt, {
            zone: 'utc',
          }).toJSDate()
        : null,
    )
  }

  public static create(
    props: IWalletHistoryProps,
    id?: UniqueEntityID,
  ): WalletHistoryEntity {
    return new WalletHistoryEntity(props, id)
  }
}

export class WalletHistoryEntities extends Entity<Array<WalletHistoryEntity>> {
  constructor(props: Array<WalletHistoryEntity>) {
    super(props)
  }

  get items(): Array<WalletHistoryEntity> {
    return this.props
  }

  public static create(
    props: Array<WalletHistoryEntity>,
  ): WalletHistoryEntities {
    return new WalletHistoryEntities(props)
  }

  /**
   * @description Group wallet histories by hour
   * @returns {Record<string, Array<WalletHistoryEntity>>} - Grouped wallet histories keyed by ISO string representation of hour
   * @example
   * {
   *  '2020-01-01T00:00:00.000+00:00': [WalletHistoryEntity, WalletHistoryEntity],
   * '2020-01-01T01:00:00.000+00:00': [WalletHistoryEntity, WalletHistoryEntity],
   * }
   */
  groupByHour(): Record<string, Array<WalletHistoryEntity>> {
    return this.items.reduce((acc, curr) => {
      const hour = formatJSDateToISO(
        DateTime.fromJSDate(curr.datetime, {
          zone: 'utc',
        })
          .startOf('hour')
          .toJSDate(),
      )
      if (!acc[hour]) {
        acc[hour] = [curr]
      } else {
        acc[hour].push(curr)
      }
      return acc
    }, {} as Record<string, Array<WalletHistoryEntity>>)
  }
}
