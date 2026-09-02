import { formatDollarBigInt } from "@/lib/number_formatter"

/**
 * lockData.tanPrice does NOT arrive with 18 decimals.
 *
 * VsTANInfo.getVsTanInfo computes it as `tanLP.last_prices() * 1e18 / ethPrice`, where ethPrice is
 * itself `latestAnswer() * 10**decimals` — an 8 decimal Chainlink answer scaled by 1e8 instead of
 * 1e10. The result lands on 13 decimals in practice, which is why every display divides by 1e13.
 *
 * The value is also wrong in absolute terms today (~$0.03 against a real spot around $1.12), for two
 * reasons on the contract side : that mis-scaling, and `last_prices()` disagreeing with the pool by
 * a factor of ~100. Wiring displays through here rather than hardcoding them means they start
 * showing the truth the moment the contract is fixed.
 *
 * TODO : set to 18 once VsTANInfo.getVsTanInfo is corrected.
 */
export const TAN_PRICE_DECIMALS = 13

/** Price of one TAN, as a dollar string. */
export const tanPriceToDollar = (tanPrice: bigint | undefined, displayDecimals = 4) => {
  if (tanPrice === undefined) return ""

  return formatDollarBigInt(tanPrice, TAN_PRICE_DECIMALS, displayDecimals)
}

/**
 * Dollar value of a TAN (or vsTAN, which is 1:1 with the TAN locked in a position) amount.
 * The two decimal counts simply add up, so no intermediate division is needed.
 */
export const tanAmountToDollar = (amount: bigint | undefined, tanPrice: bigint | undefined, displayDecimals = 2) => {
  if (amount === undefined || tanPrice === undefined) return ""

  return formatDollarBigInt(amount * tanPrice, 18 + TAN_PRICE_DECIMALS, displayDecimals)
}
