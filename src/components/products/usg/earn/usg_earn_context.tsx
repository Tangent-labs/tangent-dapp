"use client"

import { useUSGContext } from "../usg_context"
import { mapPoolsAndTasks, mapTasks } from "./usg_earn_controller"
import { getCurvePools, getConvexPools, getStakeDAOPools } from "../server_api"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { EarnTask, USGStakingInfo, LpUserPoints, EarnProtocolInput, GaugeAPR } from "../usg_type"

type USGEarnContextProps = {
  children: ReactNode
  tasks: EarnProtocolInput[]
}

type USGEarnContextValues = {
  isLoading: boolean
  displayRows: EarnTask[]
  USGsUSGMetrics: USGStakingInfo | undefined
  lpUserPoints: LpUserPoints
}

export const USGEarnContext = createContext<USGEarnContextValues | undefined>(undefined)

export const USGEarnProvider = ({ children, tasks }: USGEarnContextProps) => {
  const { USGsUSGMetrics, lpUserPoints } = useUSGContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [poolsData, setPoolsData] = useState<Array<GaugeAPR>>([])

  const displayRows = useMemo(() => {
    if (!tasks || !poolsData) return []

    const mappedTasks = mapTasks(tasks, poolsData)
    return mappedTasks
  }, [tasks, poolsData])

  const fetchPoolsData = async () => {
    const [curvePools, convexPools, stakeDaoPools] = await Promise.all([getCurvePools(), getConvexPools(), getStakeDAOPools()])

    const mappedPools = mapPoolsAndTasks(curvePools, convexPools, stakeDaoPools, tasks)

    setPoolsData(mappedPools)
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
