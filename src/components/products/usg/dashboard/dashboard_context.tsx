"use client"

import { createContext, ReactNode, useContext, useMemo } from "react"
import { useUSGMaketListContext } from "../list/usg_market_list_context"
import { MarketDebtData, USGCollateralData, USGGlobalData } from "../usg_type"

type USGDashboardContextProps = {
  children: ReactNode
}

type USGDashboardContextValues = {
  userData: {
    totalUserDebt: bigint
    totalUserDeposit: bigint
    totalProtocolDeposit: bigint
    totalProtocolDebt: bigint
    USGCollateralsData: USGCollateralData[]
    marketDebtData: MarketDebtData[]
  } | null
  globalData: USGGlobalData
  marketTVLMaxValue: number
}

export const USGDashboardContext = createContext<USGDashboardContextValues | undefined>(undefined)

export const USGDashboardProvider = ({ children }: USGDashboardContextProps) => {
  const { globalData, userData } = useUSGMaketListContext()

  const marketTVLMaxValue = useMemo(() => {
    return Math.max(...(userData?.USGCollateralsData?.filter((el: USGCollateralData) => el.value > 0).map((el: USGCollateralData) => el.value) || [1]))
  }, [userData])

  const contextValue: USGDashboardContextValues = {
    globalData,
    userData,
    marketTVLMaxValue,
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
