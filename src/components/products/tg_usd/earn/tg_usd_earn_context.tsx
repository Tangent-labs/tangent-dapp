"use client"

import { ListState } from "@/types"
import { useUSGContext } from "../tg_usd_context"
import { EarnTask, USGStakingInfo, LpUserPoints } from "../tg_usd_type"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"

type TgUsdEarnContextProps = {
  children: ReactNode
  tasks: EarnTask[]
}

type TgUsdEarnContextValues = {
  isLoading: boolean
  searchValue: string | null
  setSearchValue: (value: string | null) => void
  displayRows: EarnTask[]
  customSort: (arg: ListState) => void
  USGsUSGMetrics: USGStakingInfo | undefined
  lpUserPoints: LpUserPoints
}

export const TgUsdEarnContext = createContext<TgUsdEarnContextValues | undefined>(undefined)

export const TgUsdEarnProvider = ({ children, tasks }: TgUsdEarnContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const { USGsUSGMetrics, loadUSGsUSGMetrics, lpUserPoints } = useUSGContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [searchValue, setSearchValue] = useState<string | null>(null)

  const displayRows = useMemo(() => {
    if (!tasks) return []
    setIsLoading(false)

    if (!searchValue || searchValue.trim() === "") {
      return tasks
    }

    const lowered = searchValue.toLowerCase()
    return tasks.filter((row: EarnTask) => row.name.toLowerCase().includes(lowered) || row?.asset.toLowerCase().includes(lowered))
  }, [tasks, searchValue])

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

  useEffect(() => {
    loadUSGsUSGMetrics()
  }, [currentAddress])

  const contextValue: TgUsdEarnContextValues = {
    isLoading,
    searchValue,
    setSearchValue,
    displayRows,
    customSort,
    USGsUSGMetrics,
    lpUserPoints,
  }

  return <TgUsdEarnContext.Provider value={contextValue}>{children}</TgUsdEarnContext.Provider>
}

export const useTgUsdEarnContext = () => {
  const context = useContext(TgUsdEarnContext)
  if (!context) {
    throw new Error("useTgUsdEarnContext must be used within a TgUsdEarnProvider")
  }
  return context
}
