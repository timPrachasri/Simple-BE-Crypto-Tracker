import { Entity, UniqueEntityID } from '~/shared/domain'

import { ITokenProps } from './interfaces'

export class TokenEntity extends Entity<ITokenProps> {
  constructor(props: ITokenProps, id?: UniqueEntityID) {
    super(props, id)
  }

  get id(): UniqueEntityID {
    return this._id
  }

  get name(): string {
    return this.props.name
  }

  get symbol(): string {
    return this.props.symbol
  }

  get decimals(): number {
    return this.props.decimals
  }

  public static create(props: ITokenProps, id?: UniqueEntityID): TokenEntity {
    return new TokenEntity(props, id)
  }
}
