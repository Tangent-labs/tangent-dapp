"use client"

import { Address } from "viem"

import { MarketHistoricalData, VoteTask, MarketAPRs, SavingAccountsApy, TVLData, PointsResult, LpTask } from "./usg_type"

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

// ────────────────────────────────────────
//           POINTS API CALLS
// ────────────────────────────────────────

interface TasksCache {
  timestamp: number
  wallet: Address
  data: { lp: LpTask[]; vote: VoteTask[] }
}

export async function getTasks(addr: Address) {
  const TASKS_CACHE_KEY = "TASKS_CACHE"
  const CACHE_TTL = 300_000 // 5 minutes
  const wallet = addr.toLowerCase() as Address
  const cached = localStorage.getItem(TASKS_CACHE_KEY)
  const now = new Date().getTime()
  if (cached) {
    const parsed: TasksCache = JSON.parse(cached)
    if (now - parsed.timestamp < CACHE_TTL && parsed.wallet === wallet) {
      return parsed.data
    }
  }

  const tasks = await _callTasks(addr)
  if (tasks.lp.length !== 0 && tasks.vote.length !== 0) {
    localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify({ wallet: wallet, timestamp: now, data: tasks }))
  }

  return tasks
}

async function _callTasks(account: Address) {
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

    const data: { lp: LpTask[]; vote: VoteTask[] } = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return { lp: [], vote: [] }
  }
}

interface PointsCache {
  timestamp: number
  wallet: Address
  data: PointsResult
}

export async function getPointsDetails(addr: Address, currentBlockTimestamp: number) {
  const POINTS_CACHE_KEY = "POINTS_CACHE"
  const CACHE_TTL = 300_000 // 5 minutes
  const wallet = addr.toLowerCase() as Address
  const cached = localStorage.getItem(POINTS_CACHE_KEY)
  const now = new Date().getTime()
  if (cached) {
    const parsed: PointsCache = JSON.parse(cached)
    if (now - parsed.timestamp < CACHE_TTL && parsed.wallet === wallet) {
      return parsed.data
    }
  }

  const points = await _callPointsDetails(wallet, encodeURIComponent(new Date(currentBlockTimestamp * 1000).toISOString()))
  localStorage.setItem(POINTS_CACHE_KEY, JSON.stringify({ wallet: wallet, timestamp: now, data: points }))

  return points
}

async function _callPointsDetails(currentAddress: Address, dateFrom: string) {
  try {
    const url = `${baseUrl}/points/${currentAddress}/${dateFrom}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user points")
    }

    const data: PointsResult = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch user points:", error)
    return {
      lp: { total: "", dailyRate: "", referees: "" },
      vote: { total: "", referees: "" },
      boost: {
        multiplicator: 1,
        keys: [],
      },
    }
  }
}

export type GodsonsLeaderboardItem = {
  rank: number
  address: Address
  lpPoints: number
  votePts: number
}
export type LeaderBoardPosition = {
  rank: number
  address: Address
  pts: number
}
export const getLeaderboards = async (
  user: Address
): Promise<{
  lp: LeaderBoardPosition[]
  vote: LeaderBoardPosition[]
  godsons: GodsonsLeaderboardItem[]
}> => {
  try {
    const url = `${baseUrl}/leaderboards/${user}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard")
    }

    const { lp, vote, godsons } = await response.json()
    return { lp, vote, godsons }
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error)
    return { lp: [], vote: [], godsons: [] }
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

// ────────────────────────────────────────
//           SUPPLY & APR API
// ────────────────────────────────────────

export const getsUsgApyData = async (dateTo: number, dateFrom: number | null): Promise<Array<{ timestamp: Date; amount: string }>> => {
  try {
    const url = `${baseUrl}/susg/apy/${dateTo}/${dateFrom}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch susg apy`)
    }

    const data: Array<{ timestamp: Date; amount: string }> = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch historical susg apy:", error)
    return []
  }
}

interface SavingsAPYCache {
  timestamp: number
  data: SavingAccountsApy[]
}
export async function getSavingsAPY() {
  const now = new Date().getTime()
  const SAVINGS_APY = "SAVINGS_APY"
  const CACHE_TTL = 300_000 // 5 minutes
  const cached = localStorage.getItem(SAVINGS_APY)
  if (cached) {
    const parsed: SavingsAPYCache = JSON.parse(cached)
    if (now - parsed.timestamp < CACHE_TTL) {
      return parsed.data
    }
  }
  const savingsAPYData = await _callSavingsAPY()
  // If array is empty, an error occured, we so want to redo the call asap
  if (savingsAPYData.length !== 0) {
    localStorage.setItem(SAVINGS_APY, JSON.stringify({ timestamp: now, data: savingsAPYData }))
  }
  return savingsAPYData
}

async function _callSavingsAPY(): Promise<SavingAccountsApy[]> {
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

export const getTVL = async (dateTo: number, dateFrom: number | null): Promise<Array<TVLData>> => {
  try {
    const url = `${baseUrl}/tvl/${dateTo}/${dateFrom}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tvl")
    }

    const data: Array<TVLData> = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch tvl : ", error)
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

interface MarketsAPRCache {
  timestamp: number
  data: MarketAPRs[]
}

export async function getMarketsAprs(): Promise<MarketAPRs[]> {
  const now = new Date().getTime()
  const MARKETS_APR = "MARKETS_APR"
  const CACHE_TTL = 300_000 // 5 minutes
  const cached = localStorage.getItem(MARKETS_APR)
  if (cached) {
    const parsed: MarketsAPRCache = JSON.parse(cached)
    if (now - parsed.timestamp < CACHE_TTL) {
      return parsed.data
    }
  }
  const marketsAprs = await _callMarketsAprs()
  // If array is empty, an error occured, we so want to redo the call asap
  if (marketsAprs.length !== 0) {
    localStorage.setItem(MARKETS_APR, JSON.stringify({ timestamp: now, data: marketsAprs }))
  }
  return marketsAprs
}

async function _callMarketsAprs(): Promise<MarketAPRs[]> {
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

    const data: Array<MarketAPRs> = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch aprs :", error)
    return []
  }
}
