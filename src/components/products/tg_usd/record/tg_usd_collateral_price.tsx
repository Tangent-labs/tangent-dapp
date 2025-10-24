"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
import { formatDollar } from "@/lib/number_formatter"
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
