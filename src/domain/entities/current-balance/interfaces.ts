import { TokenEntity } from '../token'

export interface ICurrentBalanceProps {
  amount: bigint
  token: TokenEntity

  updatedAt?: Date | null
  createdAt?: Date | null
}
