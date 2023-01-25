import { BigNumber } from '@ethersproject/bignumber'

/**
 * "Change the decimal unit of a number from one unit to another."
 *
 * The function takes three arguments:
 *
 * rawDecimalUnitAmount: The number to be converted.
 * currentDecimals: The number of decimal places the number currently has.
 * desiredDecimals: The number of decimal places the number should have.
 * The function returns a BigNumber
 * @param {BigNumber} rawDecimalUnitAmount - The amount of the token in decimal units.
 * @param {number} currentDecimals - The number of decimals the rawDecimalUnitAmount is in.
 * @param {number} desiredDecimals - The number of decimals you want to convert to.
 * @returns A BigNumber of the converted value.
 */
export const changeDecimalUnit = (
  rawDecimalUnitAmount: bigint,
  currentDecimals: number,
  desiredDecimals: number,
): bigint => {
  if (currentDecimals === desiredDecimals) {
    return rawDecimalUnitAmount
  }

  if (currentDecimals > desiredDecimals) {
    const exp: BigNumber = BigNumber.from(10).pow(
      currentDecimals - desiredDecimals,
    )
    return BigNumber.from(rawDecimalUnitAmount).div(exp).toBigInt()
  }

  const exp: BigNumber = BigNumber.from(10).pow(
    desiredDecimals - currentDecimals,
  )
  return BigNumber.from(rawDecimalUnitAmount).mul(exp).toBigInt()
}
