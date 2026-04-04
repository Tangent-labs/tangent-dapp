"use client"

import { Address } from "viem"
import { CollateralInfo } from "@/types"
import { CollatGraphData, USGMarket } from "../../usg_type"
import { useUSGRecordContext } from "../usg_record_context"
import { useRootContext } from "@/components/products/root/root_context"
import { fetchGraphData, fetchOracleGraphData, fetchPendlePTGraphData } from "../../client_api"
import { CRV_DUO_ETH_CVX } from "@tangent/defi-resources/build/ressources/lps/curve"
import { createContext, ReactNode, useContext, useEffect, useState, useTransition } from "react"
import {
  OraclePricePoint,
  computeAggNumberAndAggUnit,
  computeOracleBucketSizeMinutes,
  computePendleAggUnit,
  computeTimeDiff,
  mapOracleResponseToLineData,
  mapPendleResponseToGraphData,
} from "./collat_price_controller"

type CollateralPriceContextProps = {
  children: ReactNode
}

type CollateralPriceContextValues = {
  collateralInfo: CollateralInfo
  graphData: CollatGraphData | null
  oraclePriceData: OraclePricePoint[] | null
  selectTab: (s: string) => void
  timeWindow: string
  isPending: boolean
  marketInfo: USGMarket
}

export const CollateralPriceContext = createContext<CollateralPriceContextValues | undefined>(undefined)

export const CollateralPriceProvider = ({ children }: CollateralPriceContextProps) => {
  const { getCachedCurrentBlock } = useRootContext()

  const { collateralInfo, marketInfo } = useUSGRecordContext()

  const [graphData, setGraphData] = useState<CollatGraphData | null>(null)
  const [oraclePriceData, setOraclePriceData] = useState<OraclePricePoint[] | null>(null)

  const [isPending, startTransition] = useTransition()

  const [timeWindow, setTimeWindow] = useState<string>("1d")

  const selectTab = (nextTab: string) => {
    startTransition(() => {
      setGraphData(null)
      setOraclePriceData(null)
      setTimeWindow(nextTab)
    })
  }

  const fetchOraclePriceLineData = async (marketAddress: Address, customStartTime: string) => {
    if (!marketAddress) return null

    try {
      const currentBlock = await getCachedCurrentBlock()
      const currentTimeMs = Number(currentBlock.timestamp) * 1000
      const endDate = new Date(currentTimeMs)
      const bucketSizeMinutes = computeOracleBucketSizeMinutes(customStartTime)

      const resp = await fetchOracleGraphData(marketAddress, endDate.toISOString(), bucketSizeMinutes, 50)

      return mapOracleResponseToLineData(resp, bucketSizeMinutes)
    } catch (error) {
      console.error("Error fetching oracle graph data:", error)
      return null
    }
  }

  const fetchGraphDataForCurveLP = async (address: Address, customStartTime: string) => {
    if (!address) return

    try {
      const currentBlock = await getCachedCurrentBlock()
      const currentTime = new Date(Number(currentBlock.timestamp) * 1000)

      const timeDiff = computeTimeDiff(customStartTime)

      const startTime = Math.floor(currentTime.getTime() / 1000) - timeDiff

      const { aggNumber, aggUnit } = computeAggNumberAndAggUnit(customStartTime)

      const resp = await fetchGraphData(aggNumber, aggUnit, address, startTime, Math.floor(currentTime.getTime() / 1000))

      if (!resp) {
        setGraphData(null)
        return
      }

      setGraphData(resp)
    } catch (error) {
      console.error("Error fetching graph data:", error)
    }
  }

  const fetchGraphDataForPendlePT = async (address: Address, customStartTime: string) => {
    if (!address) return

    try {
      const currentBlock = await getCachedCurrentBlock()
      const currentTime = new Date(Number(currentBlock.timestamp) * 1000)

      const timeDiff = computeTimeDiff(customStartTime)

      const startTime = Math.floor(currentTime.getTime() / 1000) - timeDiff

      const aggUnit = computePendleAggUnit(customStartTime)

      const resp = await fetchPendlePTGraphData(aggUnit, address, startTime, Math.floor(currentTime.getTime() / 1000))

      const mappedData = mapPendleResponseToGraphData(resp, address) as CollatGraphData

      setGraphData(mappedData)
    } catch (error) {
      console.error("Error fetching graph data:", error)
    }
  }

  useEffect(() => {
    const loadGraphData = async () => {
      // Fetch oracle price line and candlestick data in parallel
      const oraclePromise = fetchOraclePriceLineData(marketInfo?.marketAddress, timeWindow)

      let candlePromise: Promise<void>
      if (marketInfo?.marketType === "Pendle_PT") {
        candlePromise = fetchGraphDataForPendlePT(marketInfo?.collatAddress, timeWindow)
      } else {
        const collatAddress = marketInfo?.marketName === "CVX-ETH" ? CRV_DUO_ETH_CVX : marketInfo?.collatAddress
        candlePromise = fetchGraphDataForCurveLP(collatAddress, timeWindow)
      }

      const [oracleLineData] = await Promise.all([oraclePromise, candlePromise])

      setOraclePriceData(oracleLineData)
    }

    loadGraphData()
  }, [marketInfo?.collatAddress, marketInfo?.marketAddress, marketInfo?.marketName, marketInfo?.marketType, timeWindow])

  const contextValue: CollateralPriceContextValues = {
    collateralInfo,
    selectTab,
    timeWindow,
    graphData,
    oraclePriceData,
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
