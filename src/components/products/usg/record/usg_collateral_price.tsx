"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useRef, useState } from "react"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"

import {
  CandlestickSeries,
  createChart,
  DeepPartial,
  IChartApi,
  ISeriesApi,
  IPriceLine,
  LineStyle,
  TimeChartOptions,
  Time,
  CandlestickSeriesOptions,
  CreatePriceLineOptions,
  PriceLineOptions,
} from "lightweight-charts"

type GraphData = {
  chain: string
  address: string
  data: { time: Time; open: number; high: number; low: number; close: number }[]
}

type CollateralGraphParams = {
  graphData: GraphData | null
  isPending: boolean
  liquidationPrice: bigint
}

export const CollateralGraph = ({ graphData, isPending, liquidationPrice }: CollateralGraphParams) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const priceLineRef = useRef<IPriceLine | null>(null)

  const [showBackupBadge, setShowBackupBadge] = useState(false)

  const liquidationPriceNumber = useMemo(() => {
    return Number(formatBigInt(liquidationPrice, 18, 3))
  }, [liquidationPrice])

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

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      priceLineRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!seriesRef.current || !graphData?.data?.length) return
    seriesRef.current.setData(graphData.data)
  }, [graphData])

  useEffect(() => {
    const series = seriesRef.current
    if (!series) return

    const options: Partial<PriceLineOptions> = {
      price: liquidationPriceNumber,
      color: "#ff0300",
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      axisLabelVisible: true,
      title: `Liquidation price`,
    }

    if (!priceLineRef.current) {
      priceLineRef.current = series.createPriceLine(options as CreatePriceLineOptions)
    } else {
      priceLineRef.current.applyOptions(options)
    }
  }, [liquidationPriceNumber])

  useEffect(() => {
    const series = seriesRef.current
    const container = containerRef.current
    if (!series || !container) return

    let animationFrame = 0

    const check = () => {
      animationFrame = 0

      const y = series.priceToCoordinate(liquidationPriceNumber)

      const h = container.getBoundingClientRect().height

      const outOfView = y === null || y <= 0 || y >= h

      setShowBackupBadge(outOfView)
    }

    const scheduleCheck = () => {
      if (animationFrame) return
      animationFrame = requestAnimationFrame(check)
    }

    const onPointer = () => scheduleCheck()

    container.addEventListener("pointerdown", onPointer, { passive: true })
    container.addEventListener("pointermove", onPointer, { passive: true })
    container.addEventListener("pointerup", onPointer, { passive: true })

    const ro = new ResizeObserver(() => scheduleCheck())
    ro.observe(container)

    scheduleCheck()

    return () => {
      container.removeEventListener("pointerdown", onPointer)
      container.removeEventListener("pointermove", onPointer)
      container.removeEventListener("pointerup", onPointer)

      ro.disconnect()
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [liquidationPriceNumber, isPending, graphData?.data?.length])

  return (
    <div className="relative min-h-80 w-full rounded-[10px] bg-[#0a0a0a] ring-1 ring-white/5">
      <div ref={containerRef} className={cn("absolute inset-0", isPending && "animate-pulse")} />

      {showBackupBadge && !isPending && (
        <div className="absolute bottom-2 right-2 z-10 rounded-[2px] bg-[#ff0300] px-1 py-0.5 text-xs text-white">
          Liquidation price ${liquidationPriceNumber}
        </div>
      )}
    </div>
  )
}
