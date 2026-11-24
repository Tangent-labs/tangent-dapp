"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useRef, useState } from "react"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { UI_V2 } from "@/v2/ui"
import { useResolvedTheme } from "@/v2/theme/use-appearance"

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

/** V2 palettes. The canvas needs literal colours, so the values mirror the --tgt-v2-* tokens of each theme.
 *  Candles in a soft mint and coral (not the stock trading green and red), one step deeper on the light theme. */
const V2_CHART_THEMES = {
  dark: {
    up: "#3dd6a3",
    down: "#f2727f",
    oracle: "#0075ff",
    liquidation: "#f5b544",
    text: "rgba(255,255,255,0.45)",
    grid: "rgba(255,255,255,0.04)",
  },
  light: {
    up: "#34c499",
    down: "#ef6f7c",
    oracle: "#0062d6",
    liquidation: "#e3a33b",
    text: "rgba(0,0,0,0.5)",
    grid: "rgba(0,0,0,0.06)",
  },
}

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
  const theme = useResolvedTheme()
  const V2_CHART = V2_CHART_THEMES[theme]
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const oracleSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const priceLineRef = useRef<IPriceLine | null>(null)

  const [showBackupBadge, setShowBackupBadge] = useState(false)
  const [isAboveView, setIsAboveView] = useState(false)
  // V2: the liquidation chip zooms the price scale out to frame the candles and the liquidation price together.
  // A counter, not a boolean: every click refits, even when the scale moved again since the last one (0 = off).
  const [fitRequest, setFitRequest] = useState(0)
  const fitLiquidation = fitRequest > 0
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
        textColor: UI_V2 ? V2_CHART.text : "rgba(255,255,255,0.82)",
        ...(UI_V2 ? { fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, attributionLogo: false } : {}),
      },
      grid: {
        vertLines: { color: UI_V2 ? "transparent" : "rgba(255,255,255,0.06)" },
        horzLines: { color: UI_V2 ? V2_CHART.grid : "rgba(255,255,255,0.06)" },
      },
      ...(UI_V2 ? { rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.1 } } } : {}),
      ...(UI_V2 ? {} : { rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.1 } } }),
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

    const up = UI_V2 ? V2_CHART.up : "#26a69a"
    const down = UI_V2 ? V2_CHART.down : "#ef5350"
    const seriesOptions: DeepPartial<CandlestickSeriesOptions> = {
      upColor: up,
      downColor: down,
      borderUpColor: up,
      borderDownColor: down,
      wickUpColor: up,
      wickDownColor: down,
      priceFormat: { type: "price", minMove: 0.0001 },
    }

    const series = chart.addSeries(CandlestickSeries, seriesOptions)
    seriesRef.current = series

    const oracleSeriesOptions: DeepPartial<LineSeriesOptions> = {
      color: UI_V2 ? V2_CHART.oracle : "#3b82f6",
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- built once; the theme colours are re-applied below

  useEffect(() => {
    if (!UI_V2) return
    chartRef.current?.applyOptions({ layout: { textColor: V2_CHART.text }, grid: { horzLines: { color: V2_CHART.grid } } })
    seriesRef.current?.applyOptions({
      upColor: V2_CHART.up,
      downColor: V2_CHART.down,
      borderUpColor: V2_CHART.up,
      borderDownColor: V2_CHART.down,
      wickUpColor: V2_CHART.up,
      wickDownColor: V2_CHART.down,
    })
    oracleSeriesRef.current?.applyOptions({ color: V2_CHART.oracle })
  }, [V2_CHART])

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || !graphData?.data?.length) return

    seriesRef.current.setData(graphData.data)
  }, [graphData])

  useEffect(() => {
    if (!seriesRef.current) return

    seriesRef.current.applyOptions({
      autoscaleInfoProvider: (original: () => AutoscaleInfo | null) => {
        // framed with the liquidation price: same range, stretched to reach it, with the same padding
        const withLiquidation = (r: { minValue: number; maxValue: number }) => {
          if (!fitLiquidation || !(liquidationPriceNumber > 0)) return r
          const minValue = Math.min(r.minValue, liquidationPriceNumber)
          const maxValue = Math.max(r.maxValue, liquidationPriceNumber)
          const pad = Math.max((maxValue - minValue) * PRICE_RANGE_PADDING_RATIO, 0.0001)
          return { minValue: minValue - pad, maxValue: maxValue + pad }
        }

        if (clampedVisiblePriceRange) {
          return {
            priceRange: withLiquidation(clampedVisiblePriceRange),
          }
        }

        const autoscaleInfo = original()
        if (!autoscaleInfo?.priceRange) return autoscaleInfo

        const range = autoscaleInfo.priceRange.maxValue - autoscaleInfo.priceRange.minValue
        const padding = Math.max(range * PRICE_RANGE_PADDING_RATIO, 0.0001)

        return {
          ...autoscaleInfo,
          priceRange: withLiquidation({
            minValue: autoscaleInfo.priceRange.minValue - padding,
            maxValue: autoscaleInfo.priceRange.maxValue + padding,
          }),
        }
      },
    })
    // a new autoscale provider is only read on the next scale change: switch autoscale off, then back on in the next
    // frame (two calls in the same frame are merged and change nothing). Also resets a manual drag of the scale.
    const scale = chartRef.current?.priceScale("right")
    scale?.applyOptions({ autoScale: false })
    const frame = requestAnimationFrame(() => scale?.applyOptions({ autoScale: true }))
    return () => cancelAnimationFrame(frame)
  }, [clampedVisiblePriceRange, fitRequest, liquidationPriceNumber])

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

    // V2: no loan means no liquidation price, so the line and its "$0" label are not drawn
    const hasLiquidation = !UI_V2 || liquidationPriceNumber > 0
    const options: Partial<PriceLineOptions> = {
      price: liquidationPriceNumber,
      color: UI_V2 ? V2_CHART.liquidation : "#ff0300",
      lineWidth: 1,
      lineStyle: UI_V2 ? LineStyle.Dashed : LineStyle.Dotted,
      lineVisible: hasLiquidation,
      axisLabelVisible: hasLiquidation,
      title: hasLiquidation ? `Liquidation price` : "",
    }

    if (!priceLineRef.current) {
      priceLineRef.current = series.createPriceLine(options as CreatePriceLineOptions)
    } else {
      priceLineRef.current.applyOptions(options)
    }
  }, [liquidationPriceNumber, V2_CHART])

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

    // the scale also moves on wheel zoom, time scroll and refits: re-check then too
    container.addEventListener("wheel", onPointer, { passive: true })
    const timeScale = chartRef.current?.timeScale()
    timeScale?.subscribeVisibleLogicalRangeChange(scheduleCheck)
    // after a refit the chart redraws a couple of frames later
    const settle = window.setTimeout(scheduleCheck, 160)

    scheduleCheck()

    return () => {
      container.removeEventListener("pointerdown", onPointer)
      container.removeEventListener("pointermove", onPointer)
      container.removeEventListener("pointerup", onPointer)

      ro.disconnect()
      container.removeEventListener("wheel", onPointer)
      timeScale?.unsubscribeVisibleLogicalRangeChange(scheduleCheck)
      window.clearTimeout(settle)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [liquidationPriceNumber, isPending, graphData?.data?.length, lastVisibleOracleValue, fitRequest])

  return (
    <div ref={chartShellRef} className={cn("relative min-h-80 w-full", UI_V2 ? "rounded-xl" : "rounded-[10px] bg-[#0a0a0a] ring-1 ring-white/5")}>
      <div ref={containerRef} className={cn("absolute inset-0", isPending && "animate-pulse")} />

      {oracleLabelTop !== null && !isPending && (
        <div
          className={cn("absolute right-2 z-10 px-1 py-0.5 text-xs text-on-fill", UI_V2 ? "rounded bg-action-fill tabular-nums" : "rounded-[2px] bg-[#3b82f6]")}
          style={{ top: `${oracleLabelTop}px` }}
        >
          Oracle ${(lastVisibleOracleValue || 0).toFixed(5)}
        </div>
      )}

      {showBackupBadge && !isPending && UI_V2 && liquidationPriceNumber > 0 && (
        <button
          type="button"
          onClick={() => setFitRequest((n) => n + 1)}
          title="Zoom out to show the liquidation price"
          className={cn(
            "absolute right-2 z-10 flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-2 py-1 text-[11px] tabular-nums text-ink-2 shadow-pop transition-colors hover:text-white",
            isAboveView ? "top-2" : "bottom-9"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
          Liquidation ${formatNumber(liquidationPriceNumber, 3)}
          <span className="text-ink-3">{isAboveView ? "↑" : "↓"}</span>
        </button>
      )}
      {showBackupBadge && !isPending && !UI_V2 && (
        <div className={cn("absolute right-2 z-10 rounded-[2px] bg-[#ff0300] px-1 py-0.5 text-xs text-white", isAboveView ? "top-2" : "bottom-2")}>
          Liquidation price ${formatNumber(liquidationPriceNumber, 3)}
        </div>
      )}
      {UI_V2 && fitLiquidation && !isPending && (
        <button
          type="button"
          onClick={() => setFitRequest(0)}
          className="absolute left-2 top-2 z-10 rounded-md border border-hairline bg-surface px-2 py-1 text-[11px] text-ink-2 shadow-pop transition-colors hover:text-white"
        >
          Zoom to price
        </button>
      )}
    </div>
  )
}
