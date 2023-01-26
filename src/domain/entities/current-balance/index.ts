import { Option, fromNullable } from 'fp-ts/lib/Option'
import { DateTime } from 'luxon'

import { Amount } from '~/domain/value-objects'
import { Entity } from '~/shared/domain'
import { UniqueEntityID } from '~/shared/domain'

import { TokenEntity } from '../token'
import { ICurrentBalanceProps } from './interfaces'

export class CurrentBalanceEntity extends Entity<ICurrentBalanceProps> {
  protected _amount: Amount

  constructor(props: ICurrentBalanceProps, id?: UniqueEntityID) {
    super(props, id)
    this._amount = new Amount({
      amount: props.amount,
      decimals: props.token.decimals,
    })
  }

  get id(): UniqueEntityID {
    return this._id
  }

  get amount(): Amount {
    return this._amount
  }

  get token(): TokenEntity {
    return this.props.token
  }

  get updatedAt(): Option<Date> {
    return fromNullable(
      this.props.updatedAt
        ? DateTime.fromJSDate(this.props.updatedAt, {
            zone: 'utc',
          }).toJSDate()
        : null,
    )
  }

  increaseAmount(amount: Amount): CurrentBalanceEntity {
    this._amount = this._amount.add(amount)
    return this
  }

  public static create(
    props: ICurrentBalanceProps,
    id?: UniqueEntityID,
  ): CurrentBalanceEntity {
    return new CurrentBalanceEntity(props, id)
  }
}
