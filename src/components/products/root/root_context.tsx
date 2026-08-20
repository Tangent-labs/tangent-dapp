"use client"

import { convertRange } from "./root_controller"
import { USG_CONTRACT } from "../usg/usg_repository"
import * as swapRoutes from "../usg/swapRoutes.json"
import { toast, ToastContainer } from "react-toastify"
import { getPublicClient } from "@/services/service_rpc"
import { SavingAccountsApy, TVLData } from "../usg/usg_type"
import { ToastComponent } from "@/components/design_system/toast"
import { CustomCurveRoutes } from "../usg/global_quote_controller"
import { useContext, useEffect, useState, createContext, ReactNode, useMemo } from "react"
import { getPriceHistory, getSavingsAPY, getTotalSupply, getTVL, PRICE_HISTORY_TOKENS } from "../usg/client_api"
import { VSTAN_CONTRACT } from "../vs_tan/rs_tan_repository"

export type RootContextValues = {
  curveRoutes: CustomCurveRoutes
  handleQuote: (quote: bigint, priceImpact: number) => { validQuote: bigint; validPriceImpact: number }

  isLoading: boolean
  totalSupplies: {
    USGTotalSupply: Array<{ date: number; uv: number }>
    sUSGTotalSupply: Array<{ date: number; uv: number }>
  }

  totalSupplySelectedTab: string

  tvlSelectedTab: string

  fetchTotalSupplyData: (r: string) => Promise<void>

  USGCurrentSupply: number

  sUSGCurrentSupply: number

  savingsAPY: SavingAccountsApy[]

  sUSGCurrentAPY: number

  sTanCurrentAPY: number

  protocolCurrentTVL: TVLData

  getCachedCurrentBlock: (d?: number) => Promise<Block>

  USGsUSGTotalSupplyData: {
    date: number
    usg?: number | null
    susg?: number | null
  }[]

  tvl: Array<TVLData>

  fetchTVLData: (r: string) => void

  priceSelectedTabs: {
    USG: string
    sUSG: string
  }

  priceHistory: {
    USG: Array<{ date: number; uv: number }>
    sUSG: Array<{ date: number; uv: number }>
  }

  fetchPriceHistoryData: (token: "USG" | "sUSG", range: string) => Promise<void>
}

const RootContext = createContext<RootContextValues | undefined>(undefined)

const CUSTOM_CURVE_ROUTES_KEY = "CURVE_CUSTOM_ROUTING"
const CURRENT_BLOCK = "CURRENT_BLOCK"
const CUSTOM_CURVE_ROUTES_REFRESH_MIN = 30
const CUSTOM_CURVE_ROUTES_GITHUB_URL = "https://raw.githubusercontent.com/Tangent-labs/public-files/refs/heads/main/routes.json"

interface RootProviderProps {
  children: ReactNode
}

type Block = Awaited<ReturnType<ReturnType<typeof getPublicClient>["getBlock"]>>

export const RootProvider = ({ children }: RootProviderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [savingsAPY, setSavingsAPY] = useState<SavingAccountsApy[]>([])

  const [curveRoutes, setCurveRoutes] = useState<CustomCurveRoutes>({ errors: [], success: {} })

  const handleQuote = (quote: bigint, priceImpact: number) => {
    const validPriceImpact = priceImpact > 0 ? priceImpact : 0

    if (quote && validPriceImpact >= 0) {
      return { validQuote: quote, validPriceImpact }
    } else {
      toast.error(ToastComponent, { data: { type: "Error", content: "Could not find a quote for this swap." } })
      return { validQuote: 0n, validPriceImpact: 0 }
    }
  }

  // Fetch the cached current block if it has been fetched more than 1 min.
  // Block is refetched every minutes
  const getCachedCurrentBlock = async (cacheDelay = 60_000): Promise<Block> => {
    const now = Date.now()
    const blockData = localStorage.getItem(CURRENT_BLOCK)

    if (blockData) {
      const block = JSON.parse(blockData, (_, value) => {
        return typeof value === "string" && /^\d+$/.test(value) ? BigInt(value) : value
      })
      if (block && now < block.lastRefresh) {
        return block
      }
    }

    const publicClient = getPublicClient()

    return publicClient.getBlock({ blockTag: "latest" }).then((block) => {
      localStorage.setItem(
        CURRENT_BLOCK,
        JSON.stringify({ ...block, lastRefresh: Date.now() + cacheDelay }, (_, value) => (typeof value === "bigint" ? value.toString() : value))
      )

      return block
    })
  }

  const fetchAndStore = async (localStorageKey: string) => {
    try {
      let data
      if (process.env.NEXT_PUBLIC_ENV_NAME === "local") {
        data = swapRoutes
      } else {
        const response = await fetch(CUSTOM_CURVE_ROUTES_GITHUB_URL)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        data = await response.json()
      }

      setCurveRoutes(data)

      const payload = {
        data,
        date: new Date().toISOString(),
      }

      localStorage.setItem(localStorageKey, JSON.stringify(payload))
    } catch (err) {
      console.error("Erreur lors du fetch du fichier GitHub", err)
    }
  }

  useEffect(() => {
    // Read the storage
    const raw = localStorage.getItem(CUSTOM_CURVE_ROUTES_KEY)
    let shouldFetch = true
    let storedDate: Date | null = null

    if (raw) {
      const parsed = JSON.parse(raw)

      if (parsed && typeof parsed.date === "string") {
        storedDate = new Date(parsed.date)
        const now = new Date()
        const diffMs = now.getTime() - storedDate.getTime()
        const diffMin = diffMs / (1000 * 60)

        if (diffMin < CUSTOM_CURVE_ROUTES_REFRESH_MIN) {
          shouldFetch = false
        }
      }

      if (!shouldFetch) {
        setCurveRoutes(parsed.data)
        return
      }
    }

    fetchAndStore(CUSTOM_CURVE_ROUTES_KEY)
  }, [])

  const [totalSupplySelectedTab, setTotalSupplySelectedTab] = useState<string>("all")

  const [tvlSelectedTab, setTvlSelectedTab] = useState<string>("all")

  const [priceSelectedTabs, setPriceSelectedTabs] = useState<{
    USG: string
    sUSG: string
  }>({
    USG: "1m",
    sUSG: "1m",
  })

  const [totalSupplies, setTotalSupplies] = useState<{
    USGTotalSupply: Array<{ date: number; uv: number }>
    sUSGTotalSupply: Array<{ date: number; uv: number }>
  }>({
    USGTotalSupply: [],
    sUSGTotalSupply: [],
  })

  const [tvl, setTvl] = useState<Array<TVLData>>([])

  const [priceHistoryByRange, setPriceHistoryByRange] = useState<
    Record<string, { USG: Array<{ date: number; uv: number }>; sUSG: Array<{ date: number; uv: number }> }>
  >({})

  const [priceHistory, setPriceHistory] = useState<{
    USG: Array<{ date: number; uv: number }>
    sUSG: Array<{ date: number; uv: number }>
  }>({
    USG: [],
    sUSG: [],
  })

  const fetchTotalSupplyData = async (range: string) => {
    setTotalSupplySelectedTab(range)

    try {
      const rangeInMilliseconds = convertRange(range)
      const currentBlock = await getCachedCurrentBlock()
      const toIso = Number(currentBlock.timestamp) * 1000
      const fromIso = rangeInMilliseconds ? new Date(toIso).getTime() - rangeInMilliseconds : null

      const [usgSupply, sUsgSupply] = await Promise.all([getTotalSupply(toIso, fromIso, USG_CONTRACT.USG), getTotalSupply(toIso, fromIso, USG_CONTRACT.SUSG)])

      const USGData = usgSupply.map((p) => ({ date: new Date(p.timestamp).getTime(), uv: Number(p.amount) }))
      const sUSGData = sUsgSupply.map((p) => ({ date: new Date(p.timestamp).getTime(), uv: Number(p.amount) }))

      setTotalSupplies({ USGTotalSupply: USGData, sUSGTotalSupply: sUSGData })
    } catch {
      setTotalSupplies({ USGTotalSupply: [], sUSGTotalSupply: [] })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTVLData = async (range: string) => {
    setTvlSelectedTab(range)

    fetchAndSetTvl(range)
  }

  const fetchPriceHistoryData = async (token: "USG" | "sUSG", range: string) => {
    setPriceSelectedTabs((prev) => ({ ...prev, [token]: range }))

    const cachedRangeData = priceHistoryByRange[range]
    if (cachedRangeData) {
      setPriceHistory((prev) => ({ ...prev, [token]: cachedRangeData[token] }))
      return
    }

    const data = await getPriceHistory([PRICE_HISTORY_TOKENS.USG, PRICE_HISTORY_TOKENS.sUSG], range)

    const rangeData = data.reduce<{ USG: Array<{ date: number; uv: number }>; sUSG: Array<{ date: number; uv: number }> }>(
      (acc, tokenHistory) => {
        const mappedHistory = tokenHistory.history.map((point) => ({ date: new Date(point.timestamp).getTime(), uv: Number(point.amount) }))
        const tokenAddress = tokenHistory.tokenAddress.toLowerCase()
        if (tokenAddress === PRICE_HISTORY_TOKENS.USG.toLowerCase()) acc.USG = mappedHistory
        if (tokenAddress === PRICE_HISTORY_TOKENS.sUSG.toLowerCase()) acc.sUSG = mappedHistory
        return acc
      },
      { USG: [], sUSG: [] }
    )

    setPriceHistoryByRange((prev) => ({ ...prev, [range]: rangeData }))
    setPriceHistory((prev) => ({ ...prev, [token]: rangeData[token] }))
  }

  const fetchAndSetTvl = async (range?: string) => {
    const currentBlock = await getCachedCurrentBlock()
    let toIso: number
    let fromIso: number | null

    if (range) {
      const rangeInMilliseconds = convertRange(range)
      toIso = Number(currentBlock.timestamp) * 1000
      fromIso = rangeInMilliseconds ? new Date(toIso).getTime() - rangeInMilliseconds : null
    } else {
      const date = new Date(Number(currentBlock.timestamp) * 1000).toISOString()
      toIso = new Date(date).getTime()
      fromIso = new Date(date).getTime() - 30 * 24 * 60 * 60 * 1000
    }

    const tvl = await getTVL(toIso, fromIso)
    const tvlData = tvl.map((p) => ({
      date: new Date(p.date).getTime(),
      markets: p.markets,
      pegkeepers: p.pegkeepers,
      wts: p.wts,
      susg: p.susg,
      total: p.total,
    }))
    setTvl(tvlData)
  }

  const USGsUSGTotalSupplyData = useMemo(() => {
    const map = new Map<number, { date: number; usg?: number; susg?: number }>()

    totalSupplies.USGTotalSupply.forEach((point) => {
      const usgExistingData = map.get(point.date) || { date: point.date }
      map.set(point.date, { ...usgExistingData, usg: point.uv })
    })

    totalSupplies.sUSGTotalSupply.forEach((point) => {
      const sUSGExistingData = map.get(point.date) || { date: point.date }
      map.set(point.date, { ...sUSGExistingData, susg: point.uv })
    })

    return Array.from(map.values()).sort((a, b) => a.date - b.date)
  }, [totalSupplies])

  const fetchSavingsAPY = () => {
    getSavingsAPY().then((apys) => {
      setSavingsAPY(apys)
    })
  }

  useEffect(() => {
    setIsLoading(true)
    fetchTotalSupplyData("all")
    fetchTVLData("all")
    fetchSavingsAPY()

    getPriceHistory([PRICE_HISTORY_TOKENS.USG, PRICE_HISTORY_TOKENS.sUSG], "1m").then((data) => {
      const initialRangeData = data.reduce<{ USG: Array<{ date: number; uv: number }>; sUSG: Array<{ date: number; uv: number }> }>(
        (acc, tokenHistory) => {
          const mappedHistory = tokenHistory.history.map((point) => ({ date: new Date(point.timestamp).getTime(), uv: Number(point.amount) }))
          const tokenAddress = tokenHistory.tokenAddress.toLowerCase()
          if (tokenAddress === PRICE_HISTORY_TOKENS.USG.toLowerCase()) acc.USG = mappedHistory
          if (tokenAddress === PRICE_HISTORY_TOKENS.sUSG.toLowerCase()) acc.sUSG = mappedHistory
          return acc
        },
        { USG: [], sUSG: [] }
      )
      setPriceHistory(initialRangeData)
      setPriceHistoryByRange({ "1m": initialRangeData })
    })
  }, [])

  const USGCurrentSupply = useMemo(() => {
    if (totalSupplies.USGTotalSupply && totalSupplies.USGTotalSupply.length > 0) {
      const latestSupplyValue = totalSupplies.USGTotalSupply.reduce((latest, current) => (current.date > latest.date ? current : latest))
      return latestSupplyValue.uv
    }
    return 0
  }, [totalSupplies])

  const protocolCurrentTVL = useMemo(() => {
    if (tvl && tvl.length > 0) {
      const latestSupplyValue = tvl.reduce((latest, current) => (current.date > latest.date ? current : latest))

      return latestSupplyValue
    }
    return { date: 0, markets: 0, wts: 0, pegkeepers: 0, susg: 0, total: 0 }
  }, [tvl])

  const sUSGCurrentSupply = useMemo(() => {
    if (totalSupplies.sUSGTotalSupply && totalSupplies.sUSGTotalSupply.length > 0) {
      const latestSupplyValue = totalSupplies.sUSGTotalSupply.reduce((latest, current) => (current.date > latest.date ? current : latest))

      return latestSupplyValue.uv
    }
    return 0
  }, [totalSupplies])

  const sUSGCurrentAPY = useMemo(() => {
    const apy = savingsAPY.find((v) => v.tokenAddress.toLowerCase() === USG_CONTRACT.SUSG.toLowerCase())

    if (apy) return apy.value

    return 0
  }, [savingsAPY])

  // Same lookup as sUSG. Reads 0 until the savings API serves an sTAN entry — no placeholder to
  // remember to remove, it starts reporting by itself the day the backend has it.
  const sTanCurrentAPY = useMemo(() => {
    const apy = savingsAPY.find((v) => v.tokenAddress.toLowerCase() === VSTAN_CONTRACT.STAN.toLowerCase())

    if (apy) return apy.value

    return 0
  }, [savingsAPY])

  const contextValue: RootContextValues = {
    curveRoutes,
    handleQuote,
    totalSupplies,
    isLoading,
    totalSupplySelectedTab,
    USGCurrentSupply,
    sUSGCurrentSupply,
    fetchTotalSupplyData,
    savingsAPY,
    sUSGCurrentAPY,
    sTanCurrentAPY,
    getCachedCurrentBlock,
    USGsUSGTotalSupplyData,
    tvl,
    tvlSelectedTab,
    fetchTVLData,
    protocolCurrentTVL,
    priceSelectedTabs,
    priceHistory,
    fetchPriceHistoryData,
  }

  return (
    <RootContext.Provider value={contextValue}>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        draggable
        pauseOnHover={true}
        pauseOnFocusLoss={false}
      />

      {children}
    </RootContext.Provider>
  )
}

export const useRootContext = () => {
  const context = useContext(RootContext)
  if (!context) {
    throw new Error("useWalletConnexionContext must be used within a WalletConnexionProvider")
  }
  return context
}
