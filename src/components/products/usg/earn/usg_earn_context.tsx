"use client"

import { ListState } from "@/types"
import { mapPoolsAndTasks } from "./utils"
import { useUSGContext } from "../usg_context"
import { mapAPROpportunities } from "./usg_earn_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { AprOpportunityItem, USGStakingInfo, LpUserPoints } from "../usg_type"
import { EarnPoolsData, getConvexPools, getCurvePools, getPendlePools, getStakeDAOPools } from "../client_api_external"
import { opportunities } from "@/app/(products)/(usg)/earn/aprOpportunities"

type USGEarnContextProps = {
  children: ReactNode
}

type USGEarnContextValues = {
  isLoading: boolean
  displayRows: AprOpportunityItem[]
  USGsUSGMetrics: USGStakingInfo | undefined
  lpUserPoints: LpUserPoints
  getSortedRows: (rows: AprOpportunityItem[], listState: ListState) => AprOpportunityItem[]
  searchValue: string
  setSearchValue: (value: string) => void
  protocolFilter: string
  setProtocolFilter: (value: string) => void
}

export const USGEarnContext = createContext<USGEarnContextValues | undefined>(undefined)

export const USGEarnProvider = ({ children }: USGEarnContextProps) => {
  const { USGsUSGMetrics, lpUserPoints } = useUSGContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [poolsData, setPoolsData] = useState<EarnPoolsData[]>()
  const [searchValue, setSearchValue] = useState<string>("")
  const [protocolFilter, setProtocolFilter] = useState<string>("All")

  const displayRows = useMemo(() => {
    let rows = mapAPROpportunities(opportunities, poolsData)
    if (protocolFilter && protocolFilter !== "All") {
      rows = rows.filter((row) => row.protocolName === protocolFilter)
    }
    if (searchValue.trim()) {
      const lowered = searchValue.toLowerCase().trim()
      rows = rows.filter(
        (row) => row.name.toLowerCase().includes(lowered) || row.asset.toLowerCase().includes(lowered) || row.protocolName.toLowerCase().includes(lowered)
      )
    }

    return rows
  }, [poolsData, searchValue, protocolFilter])

  const fetchPoolsData = async () => {
    const [curvePools, convexPools, stakeDaoPools, pendlePools] = await Promise.all([getCurvePools(), getConvexPools(), getStakeDAOPools(), getPendlePools()])

    const poolsAndTasks = mapPoolsAndTasks(curvePools, convexPools, stakeDaoPools, pendlePools, opportunities)

    setPoolsData(poolsAndTasks)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPoolsData()
  }, [])

  const getSortedRows = (rows: AprOpportunityItem[], listState: ListState) => {
    const { key, direction } = listState.sort!

    return [...rows].sort((elementA, elementB) => {
      const aValue = elementA[key as keyof AprOpportunityItem] ?? 0
      const bValue = elementB[key as keyof AprOpportunityItem] ?? 0

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const contextValue: USGEarnContextValues = {
    isLoading,
    displayRows,
    USGsUSGMetrics,
    lpUserPoints,
    getSortedRows,
    searchValue,
    setSearchValue,
    protocolFilter,
    setProtocolFilter,
  }

  return <USGEarnContext.Provider value={contextValue}>{children}</USGEarnContext.Provider>
}

export const useUSGEarnContext = () => {
  const context = useContext(USGEarnContext)
  if (!context) {
    throw new Error("useUSGEarnContext must be used within a USGEarnProvider")
  }
  return context
}
