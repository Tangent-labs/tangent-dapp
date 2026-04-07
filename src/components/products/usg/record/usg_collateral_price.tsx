"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useRef, useState } from "react"
import { formatDollar, formatNumber } from "@/lib/number_formatter"

import {
  AutoscaleInfo,
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

// The oracle series comes with its own timestamps, which can stretch the shared time scale
// and visually separate the candles. We keep the candles as the source of truth and project
// the oracle onto candle timestamps. For the Y scale, we rely on the chart's native autoscale
// for the visible range and only add a small padding around it.
const PRICE_RANGE_PADDING_RATIO = 0.08 // Add a small visual margin around the visible autoscaled range.
const OUTLIER_WICK_RATIO = 6 // Only clamp the Y scale when a visible candle range is far above the typical visible range.

const getMedian = (values: number[]) => {
  if (values.length === 0) return null

  const sortedValues = [...values].sort((a, b) => a - b)
  const middleIndex = Math.floor(sortedValues.length / 2)

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2
  }

  return sortedValues[middleIndex]
}

const getClampedVisiblePriceRange = (candles: CollatGraphData["data"]) => {
  if (!candles?.length) return null

  const candleRanges = candles.map((candle) => candle.high - candle.low).filter((range) => Number.isFinite(range) && range > 0)

  const medianRange = getMedian(candleRanges)
  if (!medianRange || medianRange <= 0) return null

  const maxAllowedRange = medianRange * OUTLIER_WICK_RATIO
  const hasOutlier = candleRanges.some((range) => range > maxAllowedRange)

  if (!hasOutlier) return null

  const clampedLows = candles.map((candle) => Math.max(candle.low, candle.open - maxAllowedRange / 2, candle.close - maxAllowedRange / 2))
  const clampedHighs = candles.map((candle) => Math.min(candle.high, candle.open + maxAllowedRange / 2, candle.close + maxAllowedRange / 2))

  const minValue = Math.min(...clampedLows)
  const maxValue = Math.max(...clampedHighs)
  const range = Math.max(maxValue - minValue, 0.0001)
  const padding = Math.max(range * PRICE_RANGE_PADDING_RATIO, 0.0001)

  return {
    minValue: minValue - padding,
    maxValue: maxValue + padding,
  }
}

const getSnappedOraclePriceData = (candles: CollatGraphData["data"], oraclePriceData: OraclePricePoint[] | null) => {
  if (!candles?.length || !oraclePriceData?.length) return []

  const sortedOraclePoints = [...oraclePriceData].sort((a, b) => Number(a.time) - Number(b.time))

  let oracleIndex = 0

  return candles.map((candle) => {
    const candleTime = Number(candle.time)

    while (oracleIndex < sortedOraclePoints.length - 1 && Number(sortedOraclePoints[oracleIndex + 1].time) <= candleTime) {
      oracleIndex += 1
    }

    const currentPoint = sortedOraclePoints[oracleIndex]

    if (Number(currentPoint.time) > candleTime) {
      return {
        time: candle.time,
      }
    }

    return {
      time: candle.time,
      value: currentPoint.value,
    }
  })
}

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

  const snappedOraclePriceData = useMemo(() => {
    return getSnappedOraclePriceData(graphData?.data || [], oraclePriceData)
  }, [graphData, oraclePriceData])

  const clampedVisiblePriceRange = useMemo(() => {
    return getClampedVisiblePriceRange(graphData?.data || [])
  }, [graphData])

  const lastVisibleOracleValue = useMemo(() => {
    for (let index = snappedOraclePriceData.length - 1; index >= 0; index -= 1) {
      const point = snappedOraclePriceData[index]
      if ("value" in point && typeof point.value === "number") {
        return point.value
      }
    }

    return null
  }, [snappedOraclePriceData])

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
    if (!seriesRef.current) return

    seriesRef.current.applyOptions({
      autoscaleInfoProvider: (original: () => AutoscaleInfo | null) => {
        if (clampedVisiblePriceRange) {
          return {
            priceRange: clampedVisiblePriceRange,
          }
        }

        const autoscaleInfo = original()
        if (!autoscaleInfo?.priceRange) return autoscaleInfo

        const range = autoscaleInfo.priceRange.maxValue - autoscaleInfo.priceRange.minValue
        const padding = Math.max(range * PRICE_RANGE_PADDING_RATIO, 0.0001)

        return {
          ...autoscaleInfo,
          priceRange: {
            minValue: autoscaleInfo.priceRange.minValue - padding,
            maxValue: autoscaleInfo.priceRange.maxValue + padding,
          },
        }
      },
    })
  }, [clampedVisiblePriceRange])

  useEffect(() => {
    if (!oracleSeriesRef.current) return

    if (!snappedOraclePriceData.length) {
      oracleSeriesRef.current.setData([])
      return
    }

    oracleSeriesRef.current.setData(snappedOraclePriceData)
  }, [snappedOraclePriceData])

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

      const lastOracleValue = lastVisibleOracleValue
      const oracleY = lastOracleValue != null && oracleSeries ? oracleSeries.priceToCoordinate(lastOracleValue) : null
      const labelHeight = 22

      if (oracleY === null || oracleY < 0 || oracleY > h) {
        setOracleLabelTop(null)
        return
      }

      setOracleLabelTop(Math.max(8, Math.min(oracleY - labelHeight / 2, h - labelHeight - 8)))
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
  }, [liquidationPriceNumber, isPending, graphData?.data?.length, lastVisibleOracleValue])

  return (
    <div ref={chartShellRef} className="relative min-h-80 w-full rounded-[10px] bg-[#0a0a0a] ring-1 ring-white/5">
      <div ref={containerRef} className={cn("absolute inset-0", isPending && "animate-pulse")} />

      {oracleLabelTop !== null && !isPending && (
        <div className="absolute right-2 z-10 rounded-[2px] bg-[#3b82f6] px-1 py-0.5 text-xs text-white" style={{ top: `${oracleLabelTop}px` }}>
          Oracle ${(lastVisibleOracleValue || 0).toFixed(5)}
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
