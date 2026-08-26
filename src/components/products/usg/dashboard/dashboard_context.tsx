"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useUSGMaketListContext } from "../list/usg_market_list_context"
import { MarketDebtData, ProtocolRevenue, ProtocolVolume, RevenueRange, USGCollateralData, USGGlobalData, VolumeRange } from "../usg_type"
import { fetchProtocolRevenues, fetchProtocolVolumes } from "../client_api"

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

  totalRevenues: number

  protocolVolumes: ProtocolVolume[]

  selectedVolumeTab: VolumeRange

  fetchVolumes: (range: VolumeRange) => void

  totalVolumes: number
}

export const USGDashboardContext = createContext<USGDashboardContextValues | undefined>(undefined)

export const USGDashboardProvider = ({ children }: USGDashboardContextProps) => {
  const { globalData, userData } = useUSGMaketListContext()

  const [protocolRevenues, setProtocolRevenues] = useState<ProtocolRevenue[]>([])

  const [selectedRevenueTab, setSelectedRevenueTab] = useState<RevenueRange>("week")

  const [totalRevenues, setTotalRevenues] = useState(0)

  const fetchRevenues = async (range: RevenueRange) => {
    setSelectedRevenueTab(range)

    const { revenues, total } = await fetchProtocolRevenues(range)

    setProtocolRevenues(revenues)
    setTotalRevenues(total)
  }

  const [protocolVolumes, setProtocolVolumes] = useState<ProtocolVolume[]>([])

  const [selectedVolumeTab, setSelectedVolumeTab] = useState<VolumeRange>("week")

  const [totalVolumes, setTotalVolumes] = useState(0)

  const fetchVolumes = async (range: VolumeRange) => {
    setSelectedVolumeTab(range)

    const { volumes, total } = await fetchProtocolVolumes(range)

    setProtocolVolumes(volumes)
    setTotalVolumes(total)
  }

  useEffect(() => {
    fetchRevenues("week")
    fetchVolumes("week")
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
    totalRevenues,
    protocolVolumes,
    selectedVolumeTab,
    fetchVolumes,
    totalVolumes,
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
