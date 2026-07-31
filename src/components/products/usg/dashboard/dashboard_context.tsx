"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useUSGMaketListContext } from "../list/usg_market_list_context"
import { MarketDebtData, ProtocolRevenue, RevenueRange, USGCollateralData, USGGlobalData } from "../usg_type"
import { fetchProtocolRevenues } from "../client_api"

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

  marketDebtMaxValue: number

  protocolRevenues: ProtocolRevenue[]

  selectedRevenueTab: RevenueRange

  fetchRevenues: (range: RevenueRange) => void
}

export const USGDashboardContext = createContext<USGDashboardContextValues | undefined>(undefined)

export const USGDashboardProvider = ({ children }: USGDashboardContextProps) => {
  const { globalData, userData } = useUSGMaketListContext()

  const [protocolRevenues, setProtocolRevenues] = useState<ProtocolRevenue[]>([])

  const [selectedRevenueTab, setSelectedRevenueTab] = useState<RevenueRange>("week")

  const fetchRevenues = async (range: RevenueRange) => {
    setSelectedRevenueTab(range)

    const revenues = await fetchProtocolRevenues(range)
    setProtocolRevenues(revenues)
  }

  useEffect(() => {
    fetchRevenues("week")
  }, [])

  const marketDebtMaxValue = useMemo(() => {
    return Math.max(...(userData?.marketDebtData?.filter((el: MarketDebtData) => el.value > 0).map((el: MarketDebtData) => el.value) || [1]))
  }, [userData])

  const marketTVLMaxValue = useMemo(() => {
    return Math.max(...(userData?.USGCollateralsData?.filter((el: USGCollateralData) => el.value > 0).map((el: USGCollateralData) => el.value) || [1]))
  }, [userData])

  const contextValue: USGDashboardContextValues = {
    globalData,
    userData,
    marketDebtMaxValue,
    marketTVLMaxValue,
    protocolRevenues,
    selectedRevenueTab,
    fetchRevenues,
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
