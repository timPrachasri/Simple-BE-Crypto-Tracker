import { formatUnits, parseUnits } from '@ethersproject/units'

import { changeDecimalUnit } from '~/utils/unit'

import { ValueObject } from '../../shared/domain'

export interface AmountProps {
  amount: bigint
  decimals: number
}

export class Amount extends ValueObject<AmountProps> {
  /**
   * @description Amount in the smallest unit of the token
   */
  get amount(): bigint {
    return this.props.amount
  }

  get decimals() {
    return this.props.decimals
  }

  get nonZeroDecimalAmount() {
    return Number(formatUnits(this.amount, this.decimals))
  }

  add(addend: Amount) {
    return new Amount({
      amount:
        this.amount +
        changeDecimalUnit(
          addend.amount as bigint,
          addend.decimals,
          this.decimals,
        ),
      decimals: this.decimals,
    })
  }

  static zero() {
    return new Amount({
      amount: BigInt(0),
      decimals: 1,
    })
  }

  static fromNonZeroDecimalAmount(
    nonZeroDecimalAmount: number,
    decimals: number,
  ): Amount {
    return new Amount({
      amount: parseUnits(nonZeroDecimalAmount.toString(), decimals).toBigInt(),
      decimals,
    })
  }
}
