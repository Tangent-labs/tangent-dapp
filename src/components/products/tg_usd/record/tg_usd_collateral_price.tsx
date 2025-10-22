"use client"

import { Address } from "viem"
import { cn } from "@/lib/utils"
import { fetchGraphData } from "../client_api"
import { formatDollar } from "@/lib/number_formatter"
import { getCurrentBlock } from "@/services/service_rpc"
import { useUSGRecordContext } from "./tg_usd_record_context"
import Title from "@/components/design_system/structure/title"
import Divider from "@/components/design_system/structure/divider"
import { useTransition, useEffect, useState, useRef } from "react"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import TokenImage from "@/components/design_system/structure/token_image"
import { CandlestickSeries, CandlestickSeriesOptions, createChart, DeepPartial, IChartApi, ISeriesApi, Time, TimeChartOptions } from "lightweight-charts"

type GraphData = {
  chain: string
  address: string
  data: { time: Time; open: number; high: number; low: number; close: number }[]
}

type CollateralGraphParams = {
  graphData: GraphData
  isPending: boolean
}

export const CollateralGraph = ({ graphData, isPending }: CollateralGraphParams) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chartOptions: DeepPartial<TimeChartOptions> = {
      layout: {
        background: { color: "transparent" },
        textColor: "rgba(255,255,255,0.82)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      rightPriceScale: {
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderVisible: false,
        rightOffset: 2,
        fixLeftEdge: false,
        fixRightEdge: false,
        timeVisible: true,
        secondsVisible: true,
      },
      localization: {
        priceFormatter: (p: number) => formatDollar(p, 4),
      },
    }

    const chart = createChart(containerRef.current, chartOptions)
    chartRef.current = chart

    const seriesOptions: DeepPartial<CandlestickSeriesOptions> = {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: { type: "price", minMove: 0.0001 },
    }

    const series = chart.addSeries(CandlestickSeries, seriesOptions)

    seriesRef.current = series
  }, [])

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || !graphData?.data?.length) return

    seriesRef.current.setData(graphData.data)
  }, [graphData])

  return (
    <div ref={containerRef} className={cn("relative flex min-h-80 w-full rounded-[10px] bg-[#0a0a0a] ring-1 ring-white/5", isPending ? "animate-pulse" : "")} />
  )
}

export default function TgUsdCollateralPrice() {
  const { collateralInfo, marketInfo } = useUSGRecordContext()

  const [graphData, setGraphData] = useState<GraphData | null>(null)

  const [isPending, startTransition] = useTransition()

  const [timeWindow, setTimeWindow] = useState<string>("1d")

  const computeTimeDiff = (customStartTime: string) => {
    switch (customStartTime) {
      case "15m":
        return 24 * 60 * 60
      case "1h":
        return 7 * 24 * 60 * 60
      case "6h":
        return 30 * 24 * 60 * 60
      case "1d":
        return 120 * 24 * 60 * 60
      case "7d":
        return 180 * 24 * 60 * 60
      default:
        return 30 * 24 * 60 * 60
    }
  }

  const selectTab = (nextTab: string) => {
    startTransition(() => {
      setGraphData(null)
      setTimeWindow(nextTab)
    })
  }

  const computeAggNumberAndAggUnit = (customStartTime: string): { aggNumber: number; aggUnit: string } => {
    switch (customStartTime) {
      case "15m":
        return { aggNumber: 15, aggUnit: "minute" }
      case "1h":
        return { aggNumber: 1, aggUnit: "hour" }
      case "6h":
        return { aggNumber: 6, aggUnit: "hour" }
      case "1d":
        return { aggNumber: 1, aggUnit: "day" }
      case "7d":
        return { aggNumber: 7, aggUnit: "day" }
      default:
        return { aggNumber: 1, aggUnit: "day" }
    }
  }

  const fetchGraphDataForCollat = async (address: Address, customStartTime: string) => {
    if (!address) return

    try {
      const currentBlock = await getCurrentBlock()

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

  useEffect(() => {
    fetchGraphDataForCollat(marketInfo?.collatAddress, timeWindow)
  }, [marketInfo?.collatAddress, timeWindow])

  return (
    <div className="hidden w-full flex-col justify-between rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px] xl:flex">
      <Title label="Collateral price" size={"normal"} />
      <Divider />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1">
          <TokenImage token={collateralInfo?.logo} size={32} />
          <span>{collateralInfo.symbol}</span>
        </div>

        <div className="flex gap-2">
          <ButtonTab onClick={() => selectTab("15m")} label={"15m"} active={timeWindow === "15m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => selectTab("1h")} label={"1h"} active={timeWindow === "1h"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => selectTab("6h")} label={"6h"} active={timeWindow === "6h"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => selectTab("1d")} label={"1d"} active={timeWindow === "1d"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => selectTab("7d")} label={"7d"} active={timeWindow === "7d"} className="rounded-full !py-1" />
        </div>
      </div>

      {graphData && (
        <div className="w-full rounded-[10px]">
          <CollateralGraph isPending={isPending} graphData={graphData} />
        </div>
      )}
    </div>
  )
}
