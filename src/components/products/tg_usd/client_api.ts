import { Address } from "viem"

import { Boost, MarketHistoricalData, LpUserPoints, UserTask, VoteTask, VoteUserPoints, RefereesPoints, MarketAPR, SavingAccountsApy } from "./tg_usd_type"

export interface UserStatus {
  hasUsedCode: boolean
  referralCode: string | null
  friends: number
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100"

export const fetchPendlePTGraphData = async (aggUnit: string, tokenIn: Address, start: number, end: number) => {
  const queryStartDate = new Date(start * 1000)
  const queryEndDate = new Date(end * 1000)

  try {
    const url = `https://api-v2.pendle.finance/core/v4/1/prices/${tokenIn}/ohlcv?time_frame=${aggUnit}&timestamp_start=${queryStartDate}&timestamp_end=${queryEndDate}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Pendle API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Pendle API failed to fetch data:", error)
    return null
  }
}

export const fetchGraphData = async (aggNumber: number, aggUnit: string, tokenIn: Address, start: number, end: number) => {
  try {
    const url = `https://prices.curve.finance/v1/lp_ohlc/ethereum/${tokenIn}?agg_number=${aggNumber}&agg_units=${aggUnit}&start=${start}&end=${end}&price_units=usd`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Curve API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Curve API failed to fetch data:", error)
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

export const validateReferralCode = async (referralCode: string, signature: Address, currentAddress: Address, now: string) => {
  try {
    const url = `${baseUrl}/referral`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referralCode, signature, account: currentAddress, now }),
    })

    if (!response.ok) {
      throw new Error(`Referral validation failed with status ${response.status}`)
    }

    const data = await response.json()

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

    if (!response.ok) {
      throw new Error(`Referral code creation failed with status ${response.status}`)
    }

    const data = await response.json()

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

    if (!response.ok) {
      throw new Error("Failed to fetch referral status with status")
    }

    const data: UserStatus = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch referral status:", error)
    return { hasUsedCode: false, referralCode: null, friends: 0 }
  }
}

export const getHistoricalMarketData = async (marketAddress: string, range: string, currentTime: string): Promise<Array<MarketHistoricalData>> => {
  try {
    const url = `${baseUrl}/markets/${marketAddress.toLowerCase()}/dateFrom/${currentTime}?range=${range}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch historical market data")
    }

    const data: Array<MarketHistoricalData> = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch historical market data :", error)
    return []
  }
}

export const getUserVoteTasks = async (account: Address): Promise<Array<VoteTask>> => {
  try {
    const url = `${baseUrl}/tasks/vote/${account}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch vote tasks")
    }

    const data: Array<VoteTask> = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch vote tasks:", error)
    return []
  }
}

export const getUserTasks = async (account: Address): Promise<UserTask[]> => {
  try {
    const url = `${baseUrl}/tasks/${account}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tasks")
    }

    const data: UserTask[] = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return []
  }
}

export const getVoteUserPoints = async (account: Address): Promise<VoteUserPoints> => {
  try {
    const url = `${baseUrl}/vote-points/${account}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch vote points")
    }

    const data: VoteUserPoints = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch vote points:", error)
    return { voteTotalPoints: 0 }
  }
}

export const getUserRefereesPoints = async (account: Address): Promise<RefereesPoints> => {
  try {
    const url = `${baseUrl}/refereess/points/${account}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user points")
    }

    const data: RefereesPoints = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch user points:", error)
    return { lpPoints: 0, votePoints: 0 }
  }
}

export const getLpUserPoints = async (account: Address, dateFrom: string): Promise<LpUserPoints> => {
  try {
    const url = `${baseUrl}/lp-points/${account}/${dateFrom}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user points")
    }

    const data: LpUserPoints = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch user points:", error)
    return { lpDailyRate: 0, lpTotalPoints: 0 }
  }
}

export const getUserBoosts = async (account: Address): Promise<Array<Boost>> => {
  try {
    const url = `${baseUrl}/boosts/${account}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch boosts")
    }

    const boosts: Array<Boost> = await response.json()

    return boosts
  } catch (error) {
    console.error("Failed to fetch boosts:", error)
    return []
  }
}

export const getLeaderboards = async (): Promise<{
  lpLeaderboard: Array<{
    rank: number
    address: Address
    pts: number
  }>
  voteLeaderboard: Array<{
    rank: number
    address: Address
    pts: number
  }>
}> => {
  try {
    const url = `${baseUrl}/leaderboards`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard")
    }

    const { lpLeaderboard, voteLeaderboard } = await response.json()

    return { lpLeaderboard, voteLeaderboard }
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error)
    return { lpLeaderboard: [], voteLeaderboard: [] }
  }
}

export const getGodsonsLeaderboard = async (
  address: Address
): Promise<
  Array<{
    rank: number
    address: Address
    lpPoints: number
    votePts: number
  }>
> => {
  try {
    const url = `${baseUrl}/leaderboard/godsons/${address}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch godsons leaderboard")
    }

    const leaderboard: Array<{
      rank: number
      address: Address
      lpPoints: number
      votePts: number
    }> = await response.json()

    return leaderboard
  } catch (error) {
    console.error("Failed to fetch godsons leaderboard:", error)
    return []
  }
}

export const getsUsgApyData = async (dateTo: number, dateFrom: number | null, tokenAddress: string): Promise<Array<{ timestamp: Date; amount: string }>> => {
  try {
    const url = `${baseUrl}/susg/apy/${dateTo}/${dateFrom}/${tokenAddress}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch total supply of : ${tokenAddress}`)
    }

    const data: Array<{ timestamp: Date; amount: string }> = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch historical market data:", error)
    return []
  }
}

export const getTotalSupply = async (dateTo: number, dateFrom: number | null, tokenAddress: string): Promise<Array<{ timestamp: Date; amount: string }>> => {
  try {
    const url = `${baseUrl}/total-supply/${dateTo}/${dateFrom}/${tokenAddress}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch total supply of : ${tokenAddress}`)
    }

    const data: Array<{ timestamp: Date; amount: string }> = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch historical market data:", error)
    return []
  }
}

export const getSavingsAPY = async (): Promise<SavingAccountsApy[]> => {
  try {
    const url = `${baseUrl}/savingAccounts/apy`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch savings APY")
    }

    const data: SavingAccountsApy[] = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch savings APY : ", error)
    return []
  }
}

export const getMarketAprs = async (): Promise<Array<MarketAPR>> => {
  try {
    const url = `${baseUrl}/aprs`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch aprs`)
    }

    const data: Array<MarketAPR> = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch aprs :", error)
    return []
  }
}
