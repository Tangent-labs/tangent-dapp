"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useUSGMaketListContext } from "../list/usg_market_list_context"
import {
  LiquidityRange,
  LpLiquidityHistory,
  MarketDebtData,
  ProtocolRevenue,
  ProtocolVolume,
  RevenueRange,
  USGCollateralData,
  USGGlobalData,
  VolumeRange,
} from "../usg_type"
import { fetchLiquidityHistory, fetchProtocolRevenues, fetchProtocolVolumes } from "../client_api"

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

  liquidity: LpLiquidityHistory

  selectedLiquidityTab: LiquidityRange

  fetchLiquidity: (range: LiquidityRange) => void
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

  const [liquidity, setLiquidity] = useState<LpLiquidityHistory>({ total: 0, lps: [] })

  const [selectedLiquidityTab, setSelectedLiquidityTab] = useState<LiquidityRange>("1m")

  const fetchLiquidity = async (range: LiquidityRange) => {
    setSelectedLiquidityTab(range)

    const data = await fetchLiquidityHistory(range)

    // Hide dust LPs (current liquidity < $5k)
    const lps = data.lps.filter((lp) => (lp.history.at(-1)?.liquidityUsd ?? 0) >= 5_000)
    setLiquidity({ ...data, lps })
  }

  useEffect(() => {
    fetchRevenues("week")
    fetchVolumes("week")
    fetchLiquidity("1m")
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
    liquidity,
    selectedLiquidityTab,
    fetchLiquidity,
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
