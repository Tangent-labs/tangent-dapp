"use client"

import { ListState } from "@/types"
import { useUSGContext } from "../usg_context"
import { mapPoolsAndTasks, mapTasks } from "./usg_earn_controller"
import { getCurvePools, getConvexPools, getStakeDAOPools } from "../server_api"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { EarnTask, USGStakingInfo, LpUserPoints, EarnProtocolInput, GaugeAPR } from "../usg_type"

type USGEarnContextProps = {
  children: ReactNode
  tasks: EarnProtocolInput[]
}

type USGEarnContextValues = {
  isLoading: boolean
  searchValue: string | null
  setSearchValue: (value: string | null) => void
  displayRows: EarnTask[]
  customSort: (arg: ListState) => void
  USGsUSGMetrics: USGStakingInfo | undefined
  lpUserPoints: LpUserPoints
}

export const USGEarnContext = createContext<USGEarnContextValues | undefined>(undefined)

export const USGEarnProvider = ({ children, tasks }: USGEarnContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const { USGsUSGMetrics, lpUserPoints } = useUSGContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [poolsData, setPoolsData] = useState<Array<GaugeAPR>>([])

  const [searchValue, setSearchValue] = useState<string | null>(null)

  const displayRows = useMemo(() => {
    if (!tasks) return []

    if (!searchValue || searchValue.trim() === "") {
      const mappedTasks = mapTasks(tasks, poolsData)
      return mappedTasks
    }

    const lowered = searchValue.toLowerCase()
    const mappedTasks = mapTasks(tasks, poolsData)
    return mappedTasks.filter((row: EarnTask) => row.name.toLowerCase().includes(lowered) || row?.asset.toLowerCase().includes(lowered))
  }, [tasks, searchValue, poolsData])

  const customSort = (listState: ListState) => {
    const { key, direction } = listState.sort!

    displayRows.sort((elementA: EarnTask, elementB: EarnTask) => {
      const aValue = elementA[key as keyof EarnTask]
      const bValue = elementB[key as keyof EarnTask]

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const fetchPoolsData = async () => {
    const [curvePools, convexPools, stakeDaoPools] = await Promise.all([getCurvePools(), getConvexPools(), getStakeDAOPools()])

    const mappedPools = mapPoolsAndTasks(curvePools, convexPools, stakeDaoPools, tasks)

    setPoolsData(mappedPools)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPoolsData()
  }, [currentAddress])

  const contextValue: USGEarnContextValues = {
    isLoading,
    searchValue,
    setSearchValue,
    displayRows,
    customSort,
    USGsUSGMetrics,
    lpUserPoints,
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
