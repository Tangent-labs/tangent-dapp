"use client"

import { Address } from "viem"
import { CollateralInfo } from "@/types"
import { Time } from "lightweight-charts"
import { USGMarket } from "../../tg_usd_type"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { useRootContext } from "@/components/products/root/root_context"
import { fetchGraphData, fetchPendlePTGraphData } from "../../client_api"
import { CRV_DUO_ETH_CVX } from "@tangent/defi-resources/build/ressources/lps/curve"
import { createContext, ReactNode, useContext, useEffect, useState, useTransition } from "react"
import { computeAggNumberAndAggUnit, computePendleAggUnit, computeTimeDiff, mapPendleResponseToGraphData } from "./collat_price_controller"

type CollateralPriceContextProps = {
  children: ReactNode
}

type CollateralPriceContextValues = {
  collateralInfo: CollateralInfo
  graphData: GraphData | null
  selectTab: (s: string) => void
  timeWindow: string
  isPending: boolean
  marketInfo: USGMarket
}

type GraphData = {
  chain: string
  address: string
  data: { time: Time; open: number; high: number; low: number; close: number }[]
}

export const CollateralPriceContext = createContext<CollateralPriceContextValues | undefined>(undefined)

export const CollateralPriceProvider = ({ children }: CollateralPriceContextProps) => {
  const { getCachedCurrentBlock } = useRootContext()

  const { collateralInfo, marketInfo } = useUSGRecordContext()

  const [graphData, setGraphData] = useState<GraphData | null>(null)

  const [isPending, startTransition] = useTransition()

  const [timeWindow, setTimeWindow] = useState<string>("1d")

  const selectTab = (nextTab: string) => {
    startTransition(() => {
      setGraphData(null)
      setTimeWindow(nextTab)
    })
  }

  const fetchGraphDataForCurveLP = async (address: Address, customStartTime: string) => {
    if (!address) return

    try {
      const currentBlock = await getCachedCurrentBlock()

      const currentTime = new Date(Number(currentBlock.timestamp))

      const timeDiff = computeTimeDiff(customStartTime)

      const startTime = currentTime.getTime() - timeDiff

      const { aggNumber, aggUnit } = computeAggNumberAndAggUnit(customStartTime)

      const resp = await fetchGraphData(aggNumber, aggUnit, address, startTime, currentTime.getTime())

      setGraphData(resp)
    } catch (error) {
      console.error("Error fetching graph data:", error)
    }
  }

  const fetchGraphDataForPendlePT = async (address: Address, customStartTime: string) => {
    if (!address) return

    try {
      const currentBlock = await getCachedCurrentBlock()

      const currentTime = new Date(Number(currentBlock.timestamp))

      const timeDiff = computeTimeDiff(customStartTime)

      const startTime = currentTime.getTime() - timeDiff

      const aggUnit = computePendleAggUnit(customStartTime)

      const resp = await fetchPendlePTGraphData(aggUnit, address, startTime, currentTime.getTime())

      const mappedData = mapPendleResponseToGraphData(resp, address) as GraphData

      setGraphData(mappedData)
    } catch (error) {
      console.error("Error fetching graph data:", error)
    }
  }

  useEffect(() => {
    if (marketInfo?.marketType === "Pendle_PT") {
      fetchGraphDataForPendlePT(marketInfo?.collatAddress, timeWindow)
    } else {
      const collatAddress = marketInfo?.marketName === "CVX-ETH" ? CRV_DUO_ETH_CVX : marketInfo?.collatAddress

      fetchGraphDataForCurveLP(collatAddress, timeWindow)
    }
  }, [marketInfo?.collatAddress, timeWindow])

  const contextValue: CollateralPriceContextValues = {
    collateralInfo,
    selectTab,
    timeWindow,
    graphData,
    isPending,
    marketInfo,
  }

  return <CollateralPriceContext.Provider value={contextValue}>{children}</CollateralPriceContext.Provider>
}

export const useCollateralPriceContext = () => {
  const context = useContext(CollateralPriceContext)
  if (!context) {
    throw new Error("useCollateralPriceContext must be used within a CollateralPriceProvider")
  }
  return context
}
