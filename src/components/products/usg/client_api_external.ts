"use client"

import { Address } from "viem"

export type StakeDaoAPRData = {
  lpToken: {
    address: string
  }
  apr: {
    current: {
      total: number
      details: Array<{
        label: string
        value: number[]
      }>
    }
    projected: { total: number }
  }
}
export type EarnPoolsData = {
  protocol: string
  address: Address
  gaugeCrvApy?: Array<number>
  gaugeFutureCrvApy?: Array<number>
  lpTokenAddress?: Address
  convexPoolData?: { usdTotal?: number }
  usdTotal?: number
  pendleBaseAPY?: number
  details?: {
    impliedApy: number
    aggregatedApy: number
  }
  pt?: string
  yt?: string
}

export const getStakeDAOPools = async (): Promise<StakeDaoAPRData[]> => {
  try {
    const url = `https://api.stakedao.org/api/strategies/curve/`

    const response = await fetch(url, {
      method: "GET",
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

export const getConvexPools = async (): Promise<EarnPoolsData[]> => {
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

export const getCurvePools = async (): Promise<EarnPoolsData[]> => {
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

export const getPendlePools = async () => {
  try {
    const url = `https://api-v2.pendle.finance/core/v1/1/markets/active`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch pendle pools`)
    }

    const { markets } = await response.json()

    return markets
  } catch (error) {
    console.error("Failed to fetch pendle pools :", error)
    return []
  }
}
