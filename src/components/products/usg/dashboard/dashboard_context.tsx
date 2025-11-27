"use client"

import { createContext, ReactNode, useContext, useMemo } from "react"
import { useUSGMaketListContext } from "../list/usg_market_list_context"
import { TgUsdCollateralData, MarketDebtData, TgUsdGlobalData } from "../usg_type"

type USGDashboardContextProps = {
  children: ReactNode
}

type USGDashboardContextValues = {
  userData: {
    totalUserDebt: bigint
    totalUserDeposit: bigint
    totalProtocolDeposit: bigint
    totalProtocolDebt: bigint
    tgUsdCollateralsData: TgUsdCollateralData[]
    marketDebtData: MarketDebtData[]
  } | null

  globalData: TgUsdGlobalData

  marketDebtMaxValue: number
}

export const USGDashboardContext = createContext<USGDashboardContextValues | undefined>(undefined)

export const USGDashboardProvider = ({ children }: USGDashboardContextProps) => {
  const { globalData, userData } = useUSGMaketListContext()

  const marketDebtMaxValue = useMemo(() => {
    return Math.max(...(userData?.marketDebtData?.filter((el: MarketDebtData) => el.value > 0).map((el: MarketDebtData) => el.value) || [1]))
  }, [userData])

  const contextValue: USGDashboardContextValues = {
    globalData,
    userData,
    marketDebtMaxValue,
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
