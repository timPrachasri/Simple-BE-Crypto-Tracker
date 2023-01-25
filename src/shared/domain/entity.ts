import { UniqueEntityID } from './unique_entity_id'

const isEntity = (v: any): v is Entity<any> => {
  return v instanceof Entity
}

export abstract class Entity<T> {
  protected readonly _id: UniqueEntityID
  public props: T

  constructor(props: T, id?: UniqueEntityID) {
    // `_id` here is reserved initializing `uuid`, NOT for general relational database (PK, FK)
    this._id = id ? id : new UniqueEntityID()
    this.props = props
  }

  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false
    }

    if (this === object) {
      return true
    }

    if (!isEntity(object)) {
      return false
    }

    return this._id.equals(object._id)
  }
}
