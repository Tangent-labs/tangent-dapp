"use server"

import { AssetDataPriced } from "@/types"
import { Address } from "viem"
import { TGUSD_CONTRACT } from "./tg_usd_repository"

export const getTokenQuote = async (
  depositWeiValue: bigint | undefined,
  currentAddress: Address,
  collateralInfo: AssetDataPriced,
  depositAssetInfo: AssetDataPriced
) => {
  try {
    const url = `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${currentAddress}&amountIn=${depositWeiValue}&tokenIn=${depositAssetInfo?.address}&tokenOut=${collateralInfo?.address}`

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

export const returnEnsoQuote = async (depositWeiValue: bigint | undefined, currentAddress: Address, tokenOut: AssetDataPriced, tokenIn: AssetDataPriced) => {
  const data = await getTokenQuote(depositWeiValue, currentAddress, tokenOut, tokenIn)

  if (data) {
    return data
  } else if (tokenOut?.address === TGUSD_CONTRACT?.TG_USD || tokenIn?.address === TGUSD_CONTRACT?.TG_USD) {
    // CALL ChainviewCallRouterQuote
    // console.log("ChainviewCallRouterQuote")
    return { amountOut: depositWeiValue }
  } else {
    return undefined
  }
}
