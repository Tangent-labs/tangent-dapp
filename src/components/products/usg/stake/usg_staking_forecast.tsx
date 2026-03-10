"use client"

import { IconCircleHelp } from "@/components/icons"
import { ReactNode, useMemo, useState } from "react"
import { formatDollar } from "@/lib/number_formatter"
import { computedProjection } from "./usg_stake_controller"
import type { LineDot } from "recharts/types/cartesian/Line"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ValueType } from "recharts/types/component/DefaultTooltipContent"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000

const MIN_RIGHT_PADDING_MS = 6 * 60 * 60 * 1000 // 6 hours
const MAX_RIGHT_PADDING_MS = 45 * 24 * 60 * 60 * 1000 // 45 days
const RIGHT_PADDING_FRACTION = 0.01 // 1% of total span

const EndDot = (lastIndex: number) =>
  function Dot(props: { cx?: number; cy?: number; index?: number }) {
    const { cx, cy, index } = props
    if (index !== lastIndex || cx == null || cy == null) return null
    return (
      <g pointerEvents="none">
        <circle cx={cx} cy={cy} r={4.5} fill="#FFFFFF" stroke="#000" strokeWidth={2} />
      </g>
    )
  }

const EndDotGradient = (lastIndex: number) =>
  function Dot(props: { cx?: number; cy?: number; index?: number }) {
    const { cx, cy, index } = props
    if (index !== lastIndex || cx == null || cy == null) return null
    return (
      <g pointerEvents="none">
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
  const x = new Date(d)
  x.setMonth(x.getMonth() + months)
  return x
}
const addYears = (d: Date, years: number) => {
  const x = new Date(d)
  x.setFullYear(x.getFullYear() + years)
  return x
}

const calculateYAxis = (minValue: number, maxValue: number) => {
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
  apr: number
  currentFeature: string
}

type RangeKey = "1m" | "3m" | "1y"

export const ForecastGraph = ({ currentInvestment, newLiquidity, apr, currentFeature }: ForecastGraphProps) => {
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
    let tickEveryDays = 1
    let tickEveryMonths = 1
    let tickFormatter: (ts: number) => string
    let tooltipFormatter: (ts: number) => string

    switch (range) {
      case "1m":
        end = addMonths(now, 1)
        step = "day"
        tickEveryDays = 7
        tickFormatter = (ts) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
        tooltipFormatter = (ts) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
        break
      case "3m":
        end = addMonths(now, 3)
        step = "day"
        tickEveryDays = 7
        tickFormatter = (ts) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
        tooltipFormatter = (ts) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
        break
      case "1y":
        end = addYears(now, 1)
        step = "month"
        tickEveryMonths = 1
        tickFormatter = (ts) => new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(ts))
        tooltipFormatter = (ts) => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(ts))
        break
    }

    const points: Array<{ t: number; baseAmount: number; amountWithLiquidity: number }> = []
    const ticks: number[] = []
    let cursor = new Date(now)

    const pushPoint = (date: Date) => {
      const t = date.getTime()
      const timeInYears = (t - now.getTime()) / MS_PER_YEAR

      let existingCompounded = 0
      let newCompounded = 0

      if (currentFeature === "stake") {
        existingCompounded = newLiquidity + computedProjection(currentInvestment, timeInYears, apr)
        newCompounded = computedProjection(currentInvestment + newLiquidity, timeInYears, apr)
      } else {
        existingCompounded = computedProjection(currentInvestment, timeInYears, apr)
        newCompounded = computedProjection(currentInvestment - newLiquidity, timeInYears, apr)
      }

      points.push({
        t,
        baseAmount: Number(existingCompounded.toFixed(2)),
        amountWithLiquidity: Number(newCompounded.toFixed(2)),
      })
    }

    const pushTicksDays = (every: number) => {
      let d = new Date(now)
      while (d <= end) {
        ticks.push(d.getTime())
        d = addDays(d, every)
      }
    }

    const pushTicksMonths = (every: number) => {
      let m = new Date(now.getFullYear(), now.getMonth(), 1)
      const final = new Date(end.getFullYear(), end.getMonth(), 1)
      while (m <= final) {
        ticks.push(m.getTime())
        m = addMonths(m, every)
      }
    }

    if (step === "day") {
      while (cursor <= end) {
        pushPoint(cursor)
        cursor = addDays(cursor, 1)
      }
      pushTicksDays(tickEveryDays)
    } else {
      while (cursor <= end) {
        pushPoint(cursor)
        cursor = addMonths(cursor, 1)
      }
      pushTicksMonths(tickEveryMonths)
    }

    // Put some padding to the right so that the edge point isn’t cut off
    const spanMs = end.getTime() - now.getTime()
    const paddingMs = Math.max(MIN_RIGHT_PADDING_MS, Math.min(MAX_RIGHT_PADDING_MS, RIGHT_PADDING_FRACTION * spanMs))
    const endTs = end.getTime() + paddingMs

    return {
      data: points,
      ticks,
      fmtTick: tickFormatter,
      fmtTooltipLabel: tooltipFormatter,
      startTs: now.getTime(),
      endTs,
    }
  }, [range, currentInvestment, newLiquidity, apr])

  const allValues = useMemo(() => {
    const base = forecastData.map((d) => d.baseAmount)
    return newLiquidity > 0 ? base.concat(forecastData.map((d) => d.amountWithLiquidity)) : base
  }, [forecastData, newLiquidity])

  const yAxis = calculateYAxis(Math.min(...allValues), Math.max(...allValues))

  const showSecondLine = newLiquidity > 0

  return (
    <>
      <div className="flex w-full justify-between">
        <div className="flex items-center justify-start gap-2">
          <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-3 py-1.5">
            <TokenImage token="sUSG" size={20} />
            sUSG
          </div>

          <div className="flex flex-col items-center justify-center rounded-[10px] bg-button-active px-4 py-1">
            <span className="text-lg font-semibold">{apr.toFixed(2)}%</span>
          </div>

          <HoverCard openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
              <button type="button" className="inline-flex items-center">
                <IconCircleHelp className="h-auto w-[14px] text-white" />
              </button>
            </HoverCardTrigger>

            <HoverCardContent side="top" align="center" className="z-1001 w-fit max-w-64 p-2 text-xs">
              Estimated Annual Percentage Yield based on the last rewards distribution.
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="hidden items-end justify-end gap-2 md:flex">
          <ButtonTab onClick={() => setRange("1m")} label={"1m"} active={range === "1m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => setRange("3m")} label={"3m"} active={range === "3m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => setRange("1y")} label={"1y"} active={range === "1y"} className="rounded-full !py-1" />
        </div>
      </div>

      {!!apr && apr > 0 ? (
        <div className="mb mt-3 flex h-72 min-h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 12, right: 16, bottom: 8, left: 8 }} data={forecastData}>
              <defs>
                <linearGradient id="gradientColor" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBF911" />
                  <stop offset="100%" stopColor="#99FF00" />
                </linearGradient>
              </defs>

              <CartesianGrid horizontal vertical={false} stroke="rgba(255,255,255,0.05)" />

              <XAxis dataKey="t" type="number" scale="time" domain={[startTs, endTs]} ticks={ticks} tickFormatter={fmtTick} tick={{ fontSize: 12 }} />

              <YAxis
                orientation="right"
                tickFormatter={(v) => `$${v}`}
                domain={[yAxis.min, yAxis.max]}
                ticks={Array.from({ length: Math.floor((yAxis.max - yAxis.min) / yAxis.stepSize) + 1 }, (_, i) => yAxis.min + i * yAxis.stepSize)}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 2 }}
                content={<CustomTooltip fmtLabel={fmtTooltipLabel} currentInvestment={currentInvestment} newLiquidity={newLiquidity} />}
              />

              <Legend />

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
      ) : (
        <div className="flex min-h-80 w-full items-center justify-center text-subtitle">No APY data</div>
      )}
    </>
  )
}
