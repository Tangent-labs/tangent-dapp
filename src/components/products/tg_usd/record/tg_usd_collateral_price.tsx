"use client"

import { useTransition, useEffect, useState } from "react"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import Divider from "@/components/design_system/structure/divider"
import Title from "@/components/design_system/structure/title"
import TokenImage from "@/components/design_system/structure/token_image"
import { useTgUsdRecordContext } from "./tg_usd_record_context"
import { CandlestickData, CandlestickSeries, createChart, DeepPartial, Time, TimeChartOptions } from "lightweight-charts"
import { fetchGraphData } from "../api"
import { getPublicClient } from "@/services/service_rpc"
import { Address } from "viem"
import { cn } from "@/lib/utils"

export type GraphData = {
  chain: string
  address: string
  data: CandlestickData<Time>[]
}

type CollateralGraphParams = {
  graphData: GraphData
  isPending: boolean
}

const CollateralGraph = ({ graphData, isPending }: CollateralGraphParams) => {
  useEffect(() => {
    const el = document.getElementById("graphContainer")

    if (el) {
      const chartOptions = { layout: { textColor: "black", background: { type: "solid", color: "black" } } }
      const chart = createChart(el, chartOptions as DeepPartial<TimeChartOptions>)

      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      })

      candlestickSeries.setData(graphData.data)

      chart.timeScale().fitContent()
    }
  }, [])

  return <div className={cn(isPending ? "shimmer" : "", "flex min-h-80 w-full")} id="graphContainer"></div>
}

export default function TgUsdCollateralPrice() {
  const { collateralInfo, marketInfo } = useTgUsdRecordContext()

  const [graphData, setGraphData] = useState<GraphData | null>(null)

  const [isPending, startTransition] = useTransition()

  const [timeWindow, setTimeWindow] = useState<string>("1w")

  const computeTimeDiff = (customStartTime: string) => {
    switch (customStartTime) {
      case "15m":
        return 15 * 60
      case "1h":
        return 60 * 60
      case "4h":
        return 4 * 60 * 60
      case "1d":
        return 24 * 60 * 60
      case "1w":
        return 7 * 24 * 60 * 60
      case "1mo":
        return 30 * 24 * 60 * 60
      default:
        return 7 * 24 * 60 * 60
    }
  }

  const selectTab = (nextTab: string) => {
    startTransition(() => {
      setGraphData(null)
      setTimeWindow(nextTab)
    })
  }

  const fetchGraphDataForCollat = async (address?: Address, customStartTime?: string) => {
    if (!address) return

    try {
      const publicClient = await getPublicClient()
      const currentBlockNumber = await publicClient.getBlockNumber()
      const block = await publicClient.getBlock({ blockNumber: currentBlockNumber })
      const currentTime = new Date(Number(block.timestamp))

      let startTime: number

      if (customStartTime) {
        const timeDiff = computeTimeDiff(customStartTime)
        startTime = currentTime.getTime() - timeDiff
      } else {
        startTime = currentTime.getTime() - 7 * 24 * 60 * 60
      }

      const resp = await fetchGraphData(address, startTime, currentTime.getTime())
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
        <div>
          <div className="flex gap-2">
            <ButtonTab onClick={() => selectTab("15m")} label={"15m"} active={timeWindow === "15m"} className="rounded-full !py-1" />
            <ButtonTab onClick={() => selectTab("1h")} label={"1h"} active={timeWindow === "1h"} className="rounded-full !py-1" />
            <ButtonTab onClick={() => selectTab("4h")} label={"4h"} active={timeWindow === "4h"} className="rounded-full !py-1" />
            <ButtonTab onClick={() => selectTab("1d")} label={"1d"} active={timeWindow === "1d"} className="rounded-full !py-1" />
            <ButtonTab onClick={() => selectTab("1w")} label={"1w"} active={timeWindow === "1w"} className="rounded-full !py-1" />
            <ButtonTab onClick={() => selectTab("1mo")} label={"1mo"} active={timeWindow === "1mo"} className="rounded-full !py-1" />
          </div>
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
