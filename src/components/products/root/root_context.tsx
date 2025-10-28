"use client"

import { toast } from "react-toastify"
import { convertRange } from "./root_controller"
import { formatCompact } from "@/lib/number_formatter"
import * as swapRoutes from "../tg_usd/swapRoutes.json"
import { SavingAccountsApy } from "../tg_usd/tg_usd_type"
import { USG_CONTRACT } from "../tg_usd/tg_usd_repository"
import { ToastComponent } from "@/components/design_system/toast"
import { getSavingsAPY, getTotalSupply } from "../tg_usd/client_api"
import { CustomCurveRoutes } from "../tg_usd/global_quote_controller"
import { getPublicClient } from "@/services/service_rpc"
import { useContext, useEffect, useState, createContext, ReactNode, useMemo } from "react"

export type RootContextValues = {
  curveRoutes: CustomCurveRoutes
  handleQuote: (quote: bigint) => bigint | null

  isLoading: boolean
  totalSupplies: {
    USGTotalSupply: Array<{ date: number; uv: number }>
    sUSGTotalSupply: Array<{ date: number; uv: number }>
  }
  USGSelectedTab: string
  sUSGSelectedTab: string

  fetchUSGTotalSupplyData: (r: string) => Promise<void>
  fetchsUSGTotalSupplyData: (r: string) => Promise<void>

  usgCurrentSupply: string

  savingsAPY: SavingAccountsApy[]

  sUSGCurrentAPY: number

  getCachedCurrentBlock: (d?: number) => Promise<Block>
}

const RootContext = createContext<RootContextValues | undefined>(undefined)

const CUSTOM_CURVE_ROUTES_KEY = "CURVE_CUSTOM_ROUTING"
const CURRENT_BLOCK = "CURRENT_BLOCK"
const CURRENT_BLOCK_DATE = "CURRENT_BLOCK_DATE"
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

  const handleQuote = (quote: bigint) => {
    if (quote) {
      return quote
    } else {
      toast.error(ToastComponent, { data: { type: "Error", content: "Could not find a quote for this swap." } })
      return null
    }
  }

  const getCachedCurrentBlock = async (cacheDelay = 600_000): Promise<Block> => {
    const now = Date.now()
    const blockData = localStorage.getItem(CURRENT_BLOCK)
    const blockDateDate = localStorage.getItem(CURRENT_BLOCK_DATE)

    if (blockData && blockDateDate) {
      const block = JSON.parse(blockData, (_, value) => {
        return typeof value === "string" && /^\d+$/.test(value) ? BigInt(value) : value
      })

      const date = JSON.parse(blockDateDate)

      if (block && now < date) return block
    }

    const publicClient = getPublicClient()

    return publicClient.getBlock({ blockTag: "latest" }).then((block) => {
      localStorage.setItem(CURRENT_BLOCK_DATE, JSON.stringify(Date.now() + cacheDelay))

      localStorage.setItem(
        CURRENT_BLOCK,
        JSON.stringify(block, (_, value) => (typeof value === "bigint" ? value.toString() : value))
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

  const [USGSelectedTab, setUSGSelectedTab] = useState<string>("1m")

  const [sUSGSelectedTab, setsUSGSelectedTab] = useState<string>("1m")

  const [totalSupplies, setTotalSupplies] = useState<{
    USGTotalSupply: Array<{ date: number; uv: number }>
    sUSGTotalSupply: Array<{ date: number; uv: number }>
  }>({
    USGTotalSupply: [],
    sUSGTotalSupply: [],
  })

  const fetchUSGTotalSupplyData = async (range: string) => {
    setUSGSelectedTab(range)

    const rangeInMilliseconds = convertRange(range)
    const currentBlock = await getCachedCurrentBlock()
    const toIso = Number(currentBlock.timestamp) * 1000
    const fromIso = rangeInMilliseconds ? new Date(toIso).getTime() - rangeInMilliseconds : null

    const usgSupply = await getTotalSupply(toIso, fromIso, USG_CONTRACT.USG)

    const USGData = usgSupply.map((p) => ({
      date: new Date(p.timestamp).getTime(),
      uv: Number(p.amount),
    }))

    setTotalSupplies((prev) => ({ ...prev, USGTotalSupply: USGData }))
  }

  const fetchsUSGTotalSupplyData = async (range: string) => {
    setsUSGSelectedTab(range)

    const rangeInMilliseconds = convertRange(range)
    const currentBlock = await getCachedCurrentBlock()
    const toIso = Number(currentBlock.timestamp) * 1000
    const fromIso = rangeInMilliseconds ? new Date(toIso).getTime() - rangeInMilliseconds : null

    const susgSupply = await getTotalSupply(toIso, fromIso, USG_CONTRACT.SUSG)

    const sUSGData = susgSupply.map((p) => ({
      date: new Date(p.timestamp).getTime(),
      uv: Number(p.amount),
    }))

    setTotalSupplies((prev) => {
      return { ...prev, sUSGTotalSupply: sUSGData }
    })
  }

  const fetchTotalSupplies = async () => {
    try {
      const currentBlock = await getCachedCurrentBlock()
      const date = new Date(Number(currentBlock.timestamp) * 1000).toISOString()
      const toIso = new Date(date).getTime()
      const fromIso = new Date(date).getTime() - 30 * 24 * 60 * 60 * 1000

      const [usgSupply, sUsgSupply] = await Promise.all([getTotalSupply(toIso, fromIso, USG_CONTRACT.USG), getTotalSupply(toIso, fromIso, USG_CONTRACT.SUSG)])

      const USGData = usgSupply.map((p) => ({
        date: new Date(p.timestamp).getTime(),
        uv: Number(p.amount),
      }))

      const sUSGData = sUsgSupply.map((p) => ({
        date: new Date(p.timestamp).getTime(),
        uv: Number(p.amount),
      }))

      setTotalSupplies({ USGTotalSupply: USGData, sUSGTotalSupply: sUSGData })
      setIsLoading(false)
    } catch {
      setIsLoading(false)
      setTotalSupplies({ USGTotalSupply: [], sUSGTotalSupply: [] })
    }
  }

  const fetchSavingsAPY = () => {
    getSavingsAPY().then((apys) => {
      setSavingsAPY(apys)
    })
  }

  useEffect(() => {
    setIsLoading(true)
    fetchTotalSupplies()
    fetchSavingsAPY()
  }, [])

  const usgCurrentSupply = useMemo(() => {
    if (totalSupplies.USGTotalSupply && totalSupplies.USGTotalSupply.length > 0) {
      const latestSupplyValue = totalSupplies.USGTotalSupply.reduce((latest, current) => (current.date > latest.date ? current : latest))

      return formatCompact(latestSupplyValue.uv)
    }
    return "0"
  }, [totalSupplies])

  const sUSGCurrentAPY = useMemo(() => {
    const apy = savingsAPY.find((v) => v.tokenAddress.toLowerCase() === USG_CONTRACT.SUSG.toLowerCase())

    if (apy) return apy.value

    return 0
  }, [savingsAPY])

  const contextValue: RootContextValues = {
    curveRoutes,
    handleQuote,
    totalSupplies,
    isLoading,
    USGSelectedTab,
    sUSGSelectedTab,
    fetchUSGTotalSupplyData,
    fetchsUSGTotalSupplyData,
    usgCurrentSupply,
    savingsAPY,
    sUSGCurrentAPY,
    getCachedCurrentBlock,
  }

  return <RootContext.Provider value={contextValue}>{children}</RootContext.Provider>
}

export const useRootContext = () => {
  const context = useContext(RootContext)
  if (!context) {
    throw new Error("useWalletConnexionContext must be used within a WalletConnexionProvider")
  }
  return context
}
