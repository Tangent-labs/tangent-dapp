"use server"

import { Address } from "viem"

export const getEnsoData = async (
  amountIn: bigint,
  tokenIn: Address,
  tokenOut: Address,
  fromAddress: Address | null,
  receiver: Address,
  minAmountOut: bigint
) => {
  try {
    const url = `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${!!fromAddress ? fromAddress : receiver}&receiver=${receiver}&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&minAmountOut=${minAmountOut}&routingStrategy=router`

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

export const fetchGraphData = async (tokenIn: Address, start: number, end: number) => {
  try {
    const url = `https://prices.curve.finance/v1/lp_ohlc/ethereum/${tokenIn}?agg_number=15&agg_units=hour&start=${start}&end=${end}&price_units=usd`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
