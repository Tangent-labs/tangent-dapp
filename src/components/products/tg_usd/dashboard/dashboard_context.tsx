"use client"

import { getCurrentBlock } from "@/services/service_rpc"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { getTotalSupply } from "../api"
import { USG_CONTRACT } from "../tg_usd_repository"
import { convertRange } from "./dashboard_controller"

type USGDashboardContextProps = {
  children: ReactNode
}

type USGDashboardContextValues = {
  isLoading: boolean
  totalSupplies: {
    USGTotalSupply: Array<{ date: number; uv: number }>
    sUSGTotalSupply: Array<{ date: number; uv: number }>
  }
  USGSelectedTab: string
  sUSGSelectedTab: string

  fetchUSGTotalSupplyData: (r: string) => Promise<void>
  fetchsUSGTotalSupplyData: (r: string) => Promise<void>
}

export const USGDashboardContext = createContext<USGDashboardContextValues | undefined>(undefined)

export const USGDashboardProvider = ({ children }: USGDashboardContextProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

    const currentBlock = await getCurrentBlock()
    const date = new Date(Number(currentBlock.timestamp) * 1000).toISOString()
    const toIso = new Date(new Date(date).getTime()).toISOString()
    const fromIso = new Date(new Date(date).getTime() - rangeInMilliseconds).toISOString()

    const usgSupply = await getTotalSupply(toIso, fromIso, USG_CONTRACT.USG)

    const USGData = usgSupply.map((p) => ({
      date: new Date(p.timestamp).getTime(),
      uv: Number(p.amount),
    }))

    setTotalSupplies((prev) => {
      return { ...prev, USGTotalSupply: USGData }
    })
  }

  const fetchsUSGTotalSupplyData = async (range: string) => {
    setsUSGSelectedTab(range)

    const rangeInMilliseconds = convertRange(range)

    const currentBlock = await getCurrentBlock()
    const date = new Date(Number(currentBlock.timestamp) * 1000).toISOString()
    const toIso = new Date(new Date(date).getTime()).toISOString()
    const fromIso = new Date(new Date(date).getTime() - rangeInMilliseconds).toISOString()

    const susgSupply = await getTotalSupply(toIso, fromIso, USG_CONTRACT.SUSG)

    const sUSGData = susgSupply.map((p) => ({
      date: new Date(p.timestamp).getTime(),
      uv: Number(p.amount),
    }))

    setTotalSupplies((prev) => {
      return { ...prev, sUSGTotalSupply: sUSGData }
    })
  }

  useEffect(() => {
    const fetchTotalSupplies = async () => {
      try {
        const currentBlock = await getCurrentBlock()
        const date = new Date(Number(currentBlock.timestamp) * 1000).toISOString()
        const toIso = new Date(new Date(date).getTime()).toISOString()
        const fromIso = new Date(new Date(date).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

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

    setIsLoading(true)
    fetchTotalSupplies()
  }, [])

  const contextValue: USGDashboardContextValues = {
    totalSupplies,
    isLoading,
    USGSelectedTab,
    sUSGSelectedTab,
    fetchUSGTotalSupplyData,
    fetchsUSGTotalSupplyData,
  }

  return <USGDashboardContext.Provider value={contextValue}>{children}</USGDashboardContext.Provider>
}

export const useUSGDashboardContext = () => {
  const context = useContext(USGDashboardContext)
  if (!context) {
    throw new Error("useUSGDashboardContext must be used within a USGDashboardProvider")
  }
  return context
}
