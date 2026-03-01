"use client"

import { useUSGContext } from "../usg_context"
import { mapPoolsAndTasks, mapAPROpportunities } from "./usg_earn_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { getCurvePools, getConvexPools, getStakeDAOPools, getPendlePools } from "../server_api"
import { AprOpportunityItem, USGStakingInfo, LpUserPoints, EarnProtocolInput, EarnPoolsData } from "../usg_type"

type USGEarnContextProps = {
  children: ReactNode
  tasks: EarnProtocolInput[]
}

type USGEarnContextValues = {
  isLoading: boolean
  displayRows: AprOpportunityItem[]
  USGsUSGMetrics: USGStakingInfo | undefined
  lpUserPoints: LpUserPoints
}

export const USGEarnContext = createContext<USGEarnContextValues | undefined>(undefined)

export const USGEarnProvider = ({ children, tasks }: USGEarnContextProps) => {
  const { USGsUSGMetrics, lpUserPoints } = useUSGContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [poolsData, setPoolsData] = useState<Array<EarnPoolsData>>()

  const displayRows = useMemo(() => {
    if (!tasks || !poolsData) return []

    const mappedTasks = mapAPROpportunities(tasks, poolsData)
    return mappedTasks
  }, [tasks, poolsData])

  const fetchPoolsData = async () => {
    const [curvePools, convexPools, stakeDaoPools, pendlePools] = await Promise.all([getCurvePools(), getConvexPools(), getStakeDAOPools(), getPendlePools()])

    const poolsAndTasks = mapPoolsAndTasks(curvePools, convexPools, stakeDaoPools, pendlePools, tasks)

    setPoolsData(poolsAndTasks)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPoolsData()
  }, [])

  const contextValue: USGEarnContextValues = {
    isLoading,
    displayRows,
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
