"use client"

import { Address } from "viem"

import {
  MarketHistoricalData,
  VoteTask,
  MarketAPRs,
  SavingAccountsApy,
  TVLData,
  PointsResult,
  LpTask,
  UserPosition,
  ProtocolRevenue,
  RevenueRange,
} from "./usg_type"
import { USG_CONTRACT } from "./usg_repository"

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

export type OracleGraphDataPoint = {
  ts: number
  price: number | null
}

export const fetchOracleGraphData = async (
  marketAddress: Address,
  dateEnd: string,
  bucketSizeMinutes: number,
  bucketCount = 50
): Promise<OracleGraphDataPoint[] | null> => {
  try {
    const safeBucketCount = Math.min(Math.max(1, bucketCount), 300)
    const safeBucketSizeMinutes = Math.min(Math.max(1, bucketSizeMinutes), 10080)
    const url = `${baseUrl}/oracle/${marketAddress}?dateEnd=${encodeURIComponent(dateEnd)}&bucketCount=${safeBucketCount}&bucketSizeMinutes=${safeBucketSizeMinutes}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Oracle API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Oracle API failed to fetch data:", error)
    return null
  }
}

export type PaginatedPositions = {
  data: UserPosition[]
  total: number
}

/**
 * Fetches a market's transaction history one page at a time.
 * Without `userAddress` it returns events from every user; with it, only that user's.
 * Pagination is offset-based and `total` is the full sample size (for page count).
 */
export const getPositions = async (market: Address, pageSize: number, offset: number, userAddress?: Address): Promise<PaginatedPositions> => {
  try {
    const params = new URLSearchParams({
      pageSize: String(pageSize),
      offset: String(offset),
    })
    if (userAddress) params.set("userAddress", userAddress)

    const url = `${baseUrl}/positions/${market}?${params.toString()}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`getPositions API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch positions:", error)
    return { data: [], total: 0 }
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

export type PriceHistoryRange = "1d" | "1w" | "1m" | "3m" | "1y" | "all" | (string & {})

export type PriceHistoryPoint = {
  timestamp: string
  amount: string
}

export type PriceHistoryTokenHistory = {
  tokenAddress: Address
  history: PriceHistoryPoint[]
}

export type PriceHistoryResponse = PriceHistoryTokenHistory[]
export type PriceHistoryTokenInput = Address | Address[]

export const PRICE_HISTORY_TOKENS = {
  USG: USG_CONTRACT.USG,
  sUSG: USG_CONTRACT.SUSG,
} as const

export const getPriceHistory = async (
  tokenAddresses: PriceHistoryTokenInput = [PRICE_HISTORY_TOKENS.USG, PRICE_HISTORY_TOKENS.sUSG],
  range: PriceHistoryRange = "1d"
): Promise<PriceHistoryResponse> => {
  try {
    const normalizedTokenAddresses = (Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses]).map((address) => address.toLowerCase())
    const encodedTokenAddresses = encodeURIComponent(normalizedTokenAddresses.join(","))
    const url = `${baseUrl}/price-history/${encodedTokenAddresses}?range=${encodeURIComponent(range)}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch price history")
    }

    const data: PriceHistoryResponse = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch price history:", error)
    return []
  }
}

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
  const EMPTY_POINTS_RESULT = {
    lp: { total: "", dailyRate: "", referees: "" },
    vote: { total: "", referees: "" },
    boost: {
      multiplicator: 1,
      keys: [],
    },
  }

  try {
    const url = `${baseUrl}/points/${currentAddress}/${dateFrom}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 404) {
      return EMPTY_POINTS_RESULT
    }
    if (!response.ok) {
      throw new Error("Failed to fetch user points")
    }

    const data: PointsResult = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch user points:", error)
    return EMPTY_POINTS_RESULT
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

export const fetchProtocolRevenues = async (range: RevenueRange): Promise<ProtocolRevenue[]> => {
  try {
    const url = `${baseUrl}/revenues/${range}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch revenues")
    }

    const data: ProtocolRevenue[] = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch revenues :", error)
    return []
  }
}
