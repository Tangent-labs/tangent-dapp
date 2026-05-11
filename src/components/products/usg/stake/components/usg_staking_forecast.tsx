"use client"

import { APRDisplay } from "./apr_display"
import { ReactNode, useMemo, useState } from "react"
import { formatMillions, formatDollar } from "@/lib/number_formatter"
import { computedProjection } from "../usg_stake_controller"
import type { LineDot } from "recharts/types/cartesian/Line"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ValueType } from "recharts/types/component/DefaultTooltipContent"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000

const MIN_RIGHT_PADDING_MS = 6 * 60 * 60 * 1000 // 6 hours
const MAX_RIGHT_PADDING_MS = 45 * 24 * 60 * 60 * 1000 // 45 days
const RIGHT_PADDING_FRACTION = 0.01 // 1% of total span
const TIME_TICK_COUNT = 7
const CHART_Y_AXIS_WIDTH = 52
// const AXIS_TICK_STYLE = { fontSize: 12, fill: "rgba(255,255,255,0.5)" }
const TICK_STYLE = { fontSize: 12, stroke: "rgba(255,255,255,0.08)" }
const AXIS_LINE_STYLE = { stroke: "rgba(255,255,255,0.5)" }

const EndDot = (lastIndex: number) =>
  function Dot(props: { cx?: number; cy?: number; index?: number }) {
    const { cx, cy, index } = props
    if (index !== lastIndex || cx == null || cy == null) return null
    return (
      <g pointerEvents="none" key={`EndDot${lastIndex}`}>
        <circle cx={cx} cy={cy} r={4.5} fill="#FFFFFF" stroke="#000" strokeWidth={2} />
      </g>
    )
  }

const EndDotGradient = (lastIndex: number) =>
  function Dot(props: { cx?: number; cy?: number; index?: number }) {
    const { cx, cy, index } = props
    if (index !== lastIndex || cx == null || cy == null) return null
    return (
      <g pointerEvents="none" key={`EndDotGradient${lastIndex}`}>
        <circle cx={cx} cy={cy} r={4.5} fill="url(#gradientColor)" stroke="#000" strokeWidth={2} />
      </g>
    )
  }

const addDays = (d: Date, days: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}
const addMonths = (d: Date, months: number) => {
  const targetYear = d.getFullYear()
  const targetMonth = d.getMonth() + months
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
  return new Date(d.getFullYear(), targetMonth, Math.min(d.getDate(), lastDayOfTargetMonth), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds())
}
const addYears = (d: Date, years: number) => {
  const x = new Date(d)
  x.setFullYear(x.getFullYear() + years)
  return x
}

const calculateYAxis = (minValue: number, maxValue: number) => {
  if (minValue === maxValue) {
    const stepSizes = [1, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 25000, 40000, 50000, 75000, 100000]
    const max = Math.max(maxValue, 1)
    const stepSize = stepSizes.find((s) => max / s < 6) ?? stepSizes[stepSizes.length - 1]
    return {
      min: 0,
      max: Math.ceil(max / stepSize) * stepSize,
      stepSize,
    }
  }

  const range = maxValue - minValue
  const stepSizes = [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 25000, 40000, 50000, 75000, 100000]
  const stepSize = stepSizes.find((s) => range / s < 6) ?? stepSizes[stepSizes.length - 1]
  const min = Math.floor(minValue / stepSize) * stepSize
  const max = Math.ceil(maxValue / stepSize) * stepSize
  return { min, max, stepSize }
}

const CustomTooltip = (props: {
  active?: boolean
  payload?: Array<{ dataKey?: string | number; value?: ValueType }>
  label?: number
  fmtLabel: (v: number) => ReactNode
  currentInvestment: number
  newLiquidity: number
}) => {
  if (!props.active || !props.payload || props.payload.length === 0) return null

  const base = props.payload.find((p) => p.dataKey === "baseAmount")
  const total = props.payload.find((p) => p.dataKey === "amountWithLiquidity")

  return (
    <div className="pointer-events-none rounded-xl bg-dark px-3 py-2 shadow-xl ring-1 ring-white/20 backdrop-blur">
      <div className="mb-1 text-[10px] uppercase tracking-wide text-white/60">{props.fmtLabel(Number(props.label))}</div>
      <div className="flex flex-col gap-1.5">
        {total && base && props.newLiquidity > 0 && Number(total?.value) > Number(base?.value) && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: "linear-gradient(90deg,#FBF911 0%,#99FF00 100%)" }} />
            <span className="text-xs text-white/70">Compounding Forecast</span>
            <span className="text-sm font-semibold">{formatDollar(Number(total.value))}</span>
          </div>
        )}

        {base && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-white" />
            <span className="text-xs text-white/70">Current Forecast</span>
            <span className="text-sm font-semibold">{formatDollar(Number(base.value))}</span>
          </div>
        )}

        {total && base && props.newLiquidity > 0 && Number(total?.value) < Number(base?.value) && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: "linear-gradient(90deg,#FBF911 0%,#99FF00 100%)" }} />
            <span className="text-xs text-white/70">Forecast if unstake</span>
            <span className="text-sm font-semibold">{formatDollar(Number(total.value))}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface ForecastGraphProps {
  currentInvestment: number
  newLiquidity: number
  apy: number
  currentFeature: string
}

type RangeKey = "1m" | "3m" | "1y"

export const ForecastGraph = ({ currentInvestment, newLiquidity, apy, currentFeature }: ForecastGraphProps) => {
  const [range, setRange] = useState<RangeKey>("1m")

  const {
    data: forecastData,
    ticks,
    fmtTick,
    fmtTooltipLabel,
    startTs,
    endTs,
  } = useMemo(() => {
    const now = new Date()

    let end: Date
    let step: "day" | "month"
    let tickFormatter: (ts: number) => string
    let tooltipFormatter: (ts: number) => string

    switch (range) {
      case "1m":
        end = addMonths(now, 1)
        step = "day"
        tickFormatter = (ts) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
        tooltipFormatter = (ts) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
        break
      case "3m":
        end = addMonths(now, 3)
        step = "day"
        tickFormatter = (ts) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
        tooltipFormatter = (ts) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
        break
      case "1y":
        end = addYears(now, 1)
        step = "month"
        tickFormatter = (ts) => new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(ts))
        tooltipFormatter = (ts) => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(ts))
        break
    }

    const points: Array<{ t: number; baseAmount: number; amountWithLiquidity: number }> = []
    let cursor = new Date(now)

    const pushPoint = (date: Date) => {
      const t = date.getTime()
      const timeInYears = (t - now.getTime()) / MS_PER_YEAR

      let existingCompounded = 0
      let newCompounded = 0

      existingCompounded = computedProjection(currentInvestment, timeInYears, apy)
      if (currentFeature === "stake") {
        newCompounded = computedProjection(currentInvestment + newLiquidity, timeInYears, apy)
      } else {
        newCompounded = computedProjection(currentInvestment - newLiquidity, timeInYears, apy)
      }

      points.push({
        t,
        baseAmount: Number(existingCompounded.toFixed(2)),
        amountWithLiquidity: Number(newCompounded.toFixed(2)),
      })
    }

    if (step === "day") {
      while (cursor <= end) {
        pushPoint(cursor)
        cursor = addDays(cursor, 1)
      }
    } else {
      while (cursor <= end) {
        pushPoint(cursor)
        cursor = addMonths(cursor, 1)
      }
      if (points.at(-1)?.t !== end.getTime()) {
        pushPoint(end)
      }
    }

    // Put some padding to the right so that the edge point isn’t cut off
    const spanMs = end.getTime() - now.getTime()
    const paddingMs = Math.max(MIN_RIGHT_PADDING_MS, Math.min(MAX_RIGHT_PADDING_MS, RIGHT_PADDING_FRACTION * spanMs))
    const endTs = end.getTime() + paddingMs
    const ticks = Array.from({ length: TIME_TICK_COUNT }, (_, i) => now.getTime() + (spanMs * i) / (TIME_TICK_COUNT - 1))

    return {
      data: points,
      ticks,
      fmtTick: tickFormatter,
      fmtTooltipLabel: tooltipFormatter,
      startTs: now.getTime(),
      endTs,
    }
  }, [range, currentInvestment, newLiquidity, apy, currentFeature])

  const allValues = useMemo(() => {
    const base = forecastData.map((d) => d.baseAmount)
    return newLiquidity > 0 ? base.concat(forecastData.map((d) => d.amountWithLiquidity)) : base
  }, [forecastData, newLiquidity])

  const yAxis = calculateYAxis(Math.min(...allValues), Math.max(...allValues))

  const showSecondLine = newLiquidity > 0
  const lastForecastPoint = forecastData.at(-1)
  const baseForecastValue = lastForecastPoint?.baseAmount ?? currentInvestment
  const liquidityForecastValue = lastForecastPoint?.amountWithLiquidity ?? baseForecastValue
  const liquidityForecastDelta = liquidityForecastValue - baseForecastValue
  const liquidityForecastLabel = currentFeature === "stake" ? "Compounding Forecast" : "Forecast if unstake"

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <APRDisplay apy={apy} />
        <div className="hidden items-end justify-end gap-2 md:flex">
          <ButtonTab onClick={() => setRange("1m")} label={"1m"} active={range === "1m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => setRange("3m")} label={"3m"} active={range === "3m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => setRange("1y")} label={"1y"} active={range === "1y"} className="rounded-full !py-1" />
        </div>
      </div>

      {!!apy && apy > 0 ? (
        <>
          <div className="relative bottom-0 mt-2.5 flex h-20 w-full items-stretch justify-start gap-2 border border-white text-xs">
            <div className="flex flex-col items-center gap-2 rounded-[10px] bg-overlay-panel p-2">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex h-2 w-2 rounded-full bg-white"></div>
                <div className="flex items-center justify-center gap-1">Current Forecast</div>
              </div>

              <div className="flex w-full items-center justify-between gap-2 font-semibold">{formatDollar(baseForecastValue)}</div>
            </div>

            {showSecondLine && (
              <div className="flex flex-col items-center gap-2 rounded-[10px] bg-overlay-panel p-2">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex h-2 w-2 rounded-full bg-gradient-to-r from-[#FBF911] to-[#99FF00]"></div>
                  <div className="flex items-center justify-center gap-1">{liquidityForecastLabel}</div>
                </div>

                <div className="flex w-full items-center justify-between gap-2 font-semibold">
                  <span>{formatDollar(liquidityForecastValue)}</span>
                  <span className="h-1 w-1 rounded-full bg-white"></span>
                  <span>{formatDollar(liquidityForecastDelta, 0)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex h-[12rem] min-h-[12rem] w-full">
            <ResponsiveContainer width="100%" height="100%" className="!max-h-none">
              <LineChart
                margin={{
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
                data={forecastData}
                className="border border-white"
              >
                <defs>
                  <linearGradient id="gradientColor" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FBF911" />
                    <stop offset="100%" stopColor="#99FF00" />
                  </linearGradient>
                </defs>

                <CartesianGrid horizontal vertical={false} stroke="rgba(255,255,255,0.05)" />

                <XAxis
                  dataKey="t"
                  type="number"
                  scale="time"
                  domain={[startTs, endTs]}
                  ticks={ticks}
                  tickFormatter={fmtTick}
                  tick={TICK_STYLE}
                  padding={{ left: 0, right: 0 }}
                  axisLine={AXIS_LINE_STYLE}
                  height={25}
                  tickLine={false}
                  allowDataOverflow
                />

                <YAxis
                  orientation="right"
                  tickFormatter={(v) => `$${formatMillions(v)}`}
                  width={CHART_Y_AXIS_WIDTH}
                  domain={[yAxis.min, yAxis.max]}
                  ticks={Array.from({ length: Math.floor((yAxis.max - yAxis.min) / yAxis.stepSize) + 1 }, (_, i) => yAxis.min + i * yAxis.stepSize)}
                  tick={TICK_STYLE}
                  axisLine={true}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 2 }}
                  content={<CustomTooltip fmtLabel={fmtTooltipLabel} currentInvestment={currentInvestment} newLiquidity={newLiquidity} />}
                />

                <Line
                  strokeWidth={2}
                  type="monotone"
                  dataKey="baseAmount"
                  stroke="#FFFFFF"
                  name="Current Position Growth"
                  dot={EndDot(forecastData.length - 1) as LineDot}
                  isAnimationActive={false}
                />

                {showSecondLine && (
                  <Line
                    strokeWidth={2}
                    type="monotone"
                    dataKey="amountWithLiquidity"
                    stroke="url(#gradientColor)"
                    name={`Total After +${formatDollar(newLiquidity, 0)}`}
                    dot={EndDotGradient(forecastData.length - 1) as LineDot}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className={`mb mt-3 flex h-full w-full items-center justify-center text-subtitle`}>No APY data</div>
      )}
    </>
  )
}
