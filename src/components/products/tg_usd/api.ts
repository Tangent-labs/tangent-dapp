"use server"

import { Address } from "viem"
import { TotalBorrow } from "./tg_usd_type"

export interface UserStatus {
  hasUsedCode: boolean
  referralCode: string | null
  friends: number
}

const baseUrl = process.env.BASE_URL || "http://localhost:3100"

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

export const getUserPositions = async (user: Address, market: Address) => {
  try {
    const url = `${baseUrl}/events/${user}/${market}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`getUserPositions API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch user positions:", error)
    return null
  }
}

export const validateReferralCode = async (referralCode: string, signature: Address, currentAddress: Address) => {
  try {
    const url = `${baseUrl}/referral`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referralCode, signature, account: currentAddress }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `Referral validation failed with status ${response.status}`)
    }

    return data
  } catch {
    return { error: "Failed to validate referral code" }
  }
}

export const generateCode = async (account: Address): Promise<string> => {
  try {
    const url = `${baseUrl}/referral/generate`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ account }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `Referral code creation failed with status ${response.status}`)
    }

    return data.message as string
  } catch {
    throw new Error("Referral code creation failed with status")
  }
}

export const getReferralStatus = async (account: Address): Promise<UserStatus> => {
  try {
    const url = `${baseUrl}/referral/status?account=${account}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data: UserStatus = await response.json()

    if (!response.ok) {
      throw new Error("Failed to fetch referral status with status")
    }

    return data
  } catch (error) {
    console.error("Failed to fetch referral status:", error)
    return { hasUsedCode: false, referralCode: null, friends: 0 }
  }
}

export const getTotalBorrow = async (range: string): Promise<TotalBorrow> => {
  try {
    const url = `${baseUrl}/total-borrow?range=${range}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data: TotalBorrow = await response.json()

    if (!response.ok) {
      throw new Error("Failed to fetch referral status with status")
    }

    return data
  } catch (error) {
    console.error("Failed to fetch total borrow data :", error)
    return { latestTotalDebt: "0", data: [] }
  }
}
