import { TokenEntity } from '../token'

export interface IWalletHistoryProps {
  datetime: Date
  amount: bigint
  token: TokenEntity

  createdAt?: Date | null
}
