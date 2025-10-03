"use client"

import { getCurrentBlock } from "@/services/service_rpc"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { getTotalSupply } from "../api"
import { USG_CONTRACT } from "../tg_usd_repository"

type USGDashboardContextProps = {
  children: ReactNode
}

type USGDashboardContextValues = {
  isLoading: boolean
  totalSupplies: {
    USGTotalSupply: Array<{ date: number; uv: number }>
    sUSGTotalSupply: Array<{ date: number; uv: number }>
  }

  selectedTab: string
  setSelectedTab: (t: string) => void
}

export const USGDashboardContext = createContext<USGDashboardContextValues | undefined>(undefined)

export const USGDashboardProvider = ({ children }: USGDashboardContextProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [selectedTab, setSelectedTab] = useState<string>("1m")

  const [totalSupplies, setTotalSupplies] = useState<{
    USGTotalSupply: Array<{ date: number; uv: number }>
    sUSGTotalSupply: Array<{ date: number; uv: number }>
  }>({
    USGTotalSupply: [],
    sUSGTotalSupply: [],
  })

  useEffect(() => {
    const fetchTotalSupplies = async () => {
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
    }

    setIsLoading(true)
    fetchTotalSupplies()
  }, [])

  const contextValue: USGDashboardContextValues = {
    totalSupplies,
    isLoading,
    selectedTab,
    setSelectedTab,
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
