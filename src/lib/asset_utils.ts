import { AssetDataPriced, TokenAmount, TokenAmountPriced, TokenAmountPricedRow } from "@/types"
import { formatUnits } from "viem"
import { formatBigInt } from "./number_formatter"

/**
 *
 */
export const getPricesFromTokenAmounts = (amounts: TokenAmount[], assets: AssetDataPriced[]): { data: TokenAmountPriced; errors: string[] } => {
  const finalData = { totalDollar: 0, details: [] as TokenAmountPricedRow[] }
  const errors: string[] = []
  amounts?.reduce<TokenAmountPriced>((agg, amount) => {
    const assetData = assets.find((a) => a.address.toLowerCase() === amount.token.toLowerCase())
    if (assetData) {
      const actualAmount = parseFloat(formatUnits(amount?.amount || 0n, assetData.decimals))
      // Calculate the dollar value for this token amount
      const dollarValue = actualAmount * assetData.price || 0
      agg.totalDollar += dollarValue
      agg.details.push({
        symbol: amount.token,
        dollarValue: dollarValue || 0,
        tokenAmount: actualAmount || 0,
        logoKey: assetData?.logoKey,
        tokenAmountFormatted: formatBigInt(amount?.amount || 0n, assetData.decimals, assetData.displayDecimals),
      })
    } else {
      errors.push(`${amount.token} has been ignored `)
    }

    return agg
  }, finalData)
  return { data: finalData, errors }
}
