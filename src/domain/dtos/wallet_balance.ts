export interface ICreateWalletHistoryInputDTO {
  amount: number
  datetime: string
}

export interface ICreateWalletHistoryOutputDTO {
  inputAmount: number
  accumAmount: number
  createdAt: string | null
}

export interface IGetWalletHistoriesInputDTO {
  startDatetime: string
  endDatetime: string
}

export interface IGetWalletHistoriesOutput {
  datetime: string
  amount: number
}

export type IGetWalletHistoriesOutputDTO = Array<IGetWalletHistoriesOutput>

export interface IGetCurrentWalletBalanceOutput {
  amount: number
  updatedAt: string
}
