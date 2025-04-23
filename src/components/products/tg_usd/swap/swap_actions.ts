"use server"

import { AssetDataPriced } from "@/types"
import { Address } from "viem"

export const getRouteTxData = async (
  amountIn: bigint | undefined,
  user: Address,
  receiveAssetInfo: AssetDataPriced,
  depositAssetInfo: AssetDataPriced,
  slippage?: number
) => {
  try {
    const url = `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${user}&receiver=${user}&tokenIn=${depositAssetInfo?.address}&tokenOut=${receiveAssetInfo?.address.trim()}&amountIn=${amountIn}&slippage=${slippage}&routingStrategy=router`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_ENSO_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch Enso data:", error)
    return null
  }
}
