"use server"

import { Address } from "viem"
import { GaugeAPR, StakeDaoAPRData } from "./usg_type"

export interface UserStatus {
  hasUsedCode: boolean
  referralCode: string | null
  friends: number
}

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

export const getStakeDAOPools = async (): Promise<Array<StakeDaoAPRData>> => {
  try {
    const url = `https://api.stakedao.org/api/strategies/curve/`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch convex pool`)
    }

    const { deployed } = await response.json()

    return deployed
  } catch (error) {
    console.error("Failed to fetch convex pool :", error)
    return []
  }
}

export const getConvexPools = async (): Promise<Array<GaugeAPR>> => {
  try {
    const url = `https://curve.convexfinance.com/api/curve/pools`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch convex pool`)
    }

    const { pools } = await response.json()

    return pools
  } catch (error) {
    console.error("Failed to fetch convex pool :", error)
    return []
  }
}

export const getCurvePools = async (): Promise<Array<GaugeAPR>> => {
  try {
    const url = `https://api.curve.finance/v1/getPools/all/ethereum`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch curve pools`)
    }

    const { data } = await response.json()

    return data?.poolData
  } catch (error) {
    console.error("Failed to fetch curve pools :", error)
    return []
  }
}
