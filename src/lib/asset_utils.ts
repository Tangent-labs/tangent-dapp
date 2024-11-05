import { AssetDataPriced, TokenAmount, TokenAmountPriced } from "@/types"
import { formatUnits } from "viem"

/**
 *
 */
export const getPricesFromTokenAmounts = (amounts: TokenAmount[], assets: AssetDataPriced[]): { data: TokenAmountPriced; errors: string[] } => {
  const finalData = { totalDollar: 0, details: [] }
  const errors: string[] = []
  amounts?.reduce<TokenAmountPriced>((agg, amount) => {
    const assetData = assets.find((a) => a.address === amount.token)
    if (assetData) {
      const actualAmount = parseFloat(formatUnits(amount?.amount || 0n, assetData.decimals))
      // Calculate the dollar value for this token amount
      const dollarValue = actualAmount * assetData.price
      agg.totalDollar += dollarValue
      agg.details.push({
        symbol: amount.token,
        dollarValue: dollarValue,
        tokenAmount: actualAmount,
      })
    } else {
      errors.push(`${amount.token} has been ignored `)
    }

    return agg
  }, finalData)
  return { data: finalData, errors }
}
