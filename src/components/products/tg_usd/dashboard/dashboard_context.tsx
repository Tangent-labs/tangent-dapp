"use client"

import { createContext, ReactNode, useContext } from "react"
import { useUSGMaketListContext } from "../list/tg_usd_market_list_context"
import { TgUsdCollateralData, MarketDebtData, TgUsdGlobalData } from "../tg_usd_type"

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
}

export const USGDashboardContext = createContext<USGDashboardContextValues | undefined>(undefined)

export const USGDashboardProvider = ({ children }: USGDashboardContextProps) => {
  const { globalData, userData } = useUSGMaketListContext()

  const contextValue: USGDashboardContextValues = {
    globalData,
    userData,
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
