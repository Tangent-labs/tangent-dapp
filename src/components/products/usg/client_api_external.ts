"use client"

import { Address } from "viem"

export type StakeDaoAPRData = {
  vault: string
  lpToken: {
    address: string
  }
  tradingApy?: number
  minApr?: number
  maxApr?: number
  apr: {
    current: {
      total: number
      details: Array<{
        label: string
        value: number[]
      }>
    }
    projected?: { total: number }
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
    const url = `https://api.stakedao.org/api/strategies/v2/curve/`

    const response = await fetch(url, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch stakeDAO pool`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch stakeDAO pool :", error)
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
    const [allPoolsResponse, stableNgResponse] = await Promise.all([
      fetch(`https://api.curve.finance/v1/getPools/all/ethereum`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      fetch(`https://api.curve.finance/api/getPools/ethereum/factory-stable-ng`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    ])

    if (!allPoolsResponse.ok || !stableNgResponse.ok) {
      throw new Error(`Failed to fetch curve pools`)
    }

    const [allPoolsData, stableNgJson] = await Promise.all([allPoolsResponse.json(), stableNgResponse.json()])

    const allPools = allPoolsData?.data?.poolData || []
    const stableNgPools = stableNgJson?.data?.poolData || []
    const stableNgByAddress = new Map(stableNgPools.map((pool: EarnPoolsData) => [String(pool.address).toLowerCase(), pool]))

    return allPools.map((pool: EarnPoolsData) => {
      const stableNgPool = stableNgByAddress.get(String(pool.address).toLowerCase())

      return stableNgPool ? { ...pool, ...stableNgPool } : pool
    })
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
