"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useRef, useState } from "react"
import { formatDollar, formatNumber } from "@/lib/number_formatter"

import {
  CandlestickSeries,
  createChart,
  DeepPartial,
  IChartApi,
  LineSeries,
  ISeriesApi,
  IPriceLine,
  LineStyle,
  TimeChartOptions,
  CandlestickSeriesOptions,
  CreatePriceLineOptions,
  LineSeriesOptions,
  PriceLineOptions,
} from "lightweight-charts"

import { CollatGraphData } from "../usg_type"
import { OraclePricePoint } from "./collat_price/collat_price_controller"

type CollateralGraphParams = {
  graphData: CollatGraphData | null
  oraclePriceData: OraclePricePoint[] | null
  isPending: boolean
  liquidationPrice: bigint
}

export const CollateralGraph = ({ graphData, oraclePriceData, isPending, liquidationPrice }: CollateralGraphParams) => {
  const visibleBarsCount = 50
  const containerRef = useRef<HTMLDivElement>(null)
  const chartShellRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const oracleSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const priceLineRef = useRef<IPriceLine | null>(null)

  const [showBackupBadge, setShowBackupBadge] = useState(false)
  const [isAboveView, setIsAboveView] = useState(false)
  const [oracleLabelTop, setOracleLabelTop] = useState<number | null>(null)

  const liquidationPriceNumber = useMemo(() => {
    return Number(Number(liquidationPrice / 10n ** 15n)?.toFixed(4)) / 1000
  }, [liquidationPrice])

  const clippedOraclePriceData = useMemo(() => {
    if (!graphData?.data?.length || !oraclePriceData?.length) return oraclePriceData

    const firstCandleTime = Number(graphData.data[0]?.time)
    const lastCandleTime = Number(graphData.data[graphData.data.length - 1]?.time)

    return oraclePriceData.filter((point) => {
      const pointTime = Number(point.time)
      return pointTime >= firstCandleTime && pointTime <= lastCandleTime
    })
  }, [graphData, oraclePriceData])

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

    const oracleSeriesOptions: DeepPartial<LineSeriesOptions> = {
      color: "#3b82f6",
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: false,
      priceLineVisible: false,
    }

    const oracleSeries = chart.addSeries(LineSeries, oracleSeriesOptions)
    oracleSeriesRef.current = oracleSeries

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const { width, height } = entry.contentRect
      chart.applyOptions({ width, height })
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      oracleSeriesRef.current = null
      priceLineRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || !graphData?.data?.length) return

    seriesRef.current.setData(graphData.data)
  }, [graphData])

  useEffect(() => {
    if (!oracleSeriesRef.current) return

    if (!clippedOraclePriceData?.length) {
      oracleSeriesRef.current.setData([])
      return
    }

    oracleSeriesRef.current.setData(clippedOraclePriceData)
  }, [clippedOraclePriceData])

  useEffect(() => {
    if (!chartRef.current || !graphData?.data?.length) return

    const timeScale = chartRef.current.timeScale()
    const barsInView = Math.min(visibleBarsCount, graphData.data.length)
    const rightOffset = 2
    const to = graphData.data.length - 1 + rightOffset
    const from = Math.max(0, to - barsInView)

    timeScale.setVisibleLogicalRange({ from, to })
    timeScale.scrollToRealTime()
  }, [graphData, oraclePriceData])

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
    const oracleSeries = oracleSeriesRef.current
    const shell = chartShellRef.current
    if (!series || !container || !shell) return

    let animationFrame = 0

    const check = () => {
      animationFrame = 0

      const y = series.priceToCoordinate(liquidationPriceNumber)
      const h = container.getBoundingClientRect().height

      setShowBackupBadge(y === null || y < 0 || y > h)
      setIsAboveView(y === null || y < 0)

      const lastOracleValue = clippedOraclePriceData?.[clippedOraclePriceData.length - 1]?.value
      const oracleY = lastOracleValue != null && oracleSeries ? oracleSeries.priceToCoordinate(lastOracleValue) : null
      const labelHeight = 22

      if (oracleY === null || oracleY < 0 || oracleY > h) {
        setOracleLabelTop(null)
        return
      }

      setOracleLabelTop(Math.max(8, Math.min(oracleY - labelHeight - 6, h - labelHeight - 8)))
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
  }, [liquidationPriceNumber, isPending, graphData?.data?.length, clippedOraclePriceData])

  return (
    <div ref={chartShellRef} className="relative min-h-80 w-full rounded-[10px] bg-[#0a0a0a] ring-1 ring-white/5">
      <div ref={containerRef} className={cn("absolute inset-0", isPending && "animate-pulse")} />

      {oracleLabelTop !== null && !isPending && (
        <div className="absolute right-2 z-10 rounded-[2px] bg-[#3b82f6] px-1 py-0.5 text-xs text-white" style={{ top: `${oracleLabelTop}px` }}>
          Oracle ${(clippedOraclePriceData?.[clippedOraclePriceData.length - 1]?.value || 0).toFixed(5)}
        </div>
      )}

      {showBackupBadge && !isPending && (
        <div className={cn("absolute right-2 z-10 rounded-[2px] bg-[#ff0300] px-1 py-0.5 text-xs text-white", isAboveView ? "top-2" : "bottom-2")}>
          Liquidation price ${formatNumber(liquidationPriceNumber, 3)}
        </div>
      )}
    </div>
  )
}
