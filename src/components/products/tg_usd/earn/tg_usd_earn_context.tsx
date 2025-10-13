"use client"

import { Address } from "viem"
import { ListState } from "@/types"
import { useUSGContext } from "../tg_usd_context"
import { mapTasks } from "./tg_usd_earn_controller"
import { getCurvePools, getConvexPools, getStakeDAOPools } from "../api"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { EarnTask, USGStakingInfo, LpUserPoints, EarnProtocolInput, GaugeAPR } from "../tg_usd_type"

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

  const { USGsUSGMetrics, loadUSGsUSGMetrics, lpUserPoints } = useUSGContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [poolsData, setPoolsData] = useState<Array<GaugeAPR>>([])

  const [searchValue, setSearchValue] = useState<string | null>(null)

  const displayRows = useMemo(() => {
    if (!tasks) return []

    if (!searchValue || searchValue.trim() === "") {
      const mappedTasks = mapTasks(tasks, poolsData)
      setIsLoading(false)
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

    const allCurvePoolsAddresses = tasks.filter((t) => t.protocolName === "Curve").map((t) => t.address)
    const allConvexPoolsAddresses = tasks.filter((t) => t.protocolName === "Convex").map((t) => t.address)
    const allStakeDaoPoolsPoolsAddresses = tasks.filter((t) => t.protocolName === "StakeDAO").map((t) => t.address)

    const curvePoolsOfInterest = curvePools
      .filter((p: GaugeAPR) => allCurvePoolsAddresses.includes(p.address))
      .map((el) => {
        return { ...el, protocol: "Curve" }
      })

    const convexPoolsOfInterest = convexPools
      .filter((p: GaugeAPR) => allConvexPoolsAddresses.includes(p.address))
      .map((el) => {
        return { ...el, protocol: "Convex" }
      })

    const stakeDaoPoolsOfInterest = stakeDaoPools
      .filter((p: { lpToken: { address: string } }) => allStakeDaoPoolsPoolsAddresses.includes(p.lpToken.address))
      .map((el) => {
        const address = el.lpToken.address as Address
        const gaugeCrvApy = el.apr.current.total
        const gaugeFutureCrvApy = el.apr.projected.total

        return { protocol: "StakeDAO", address, gaugeCrvApy: [gaugeCrvApy], gaugeFutureCrvApy: [gaugeFutureCrvApy] }
      })

    setPoolsData(curvePoolsOfInterest.concat(convexPoolsOfInterest).concat(stakeDaoPoolsOfInterest))
  }

  useEffect(() => {
    loadUSGsUSGMetrics()

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
