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

const TIME_TICK_COUNT = 7
const CHART_Y_AXIS_WIDTH = 52
const TICK_STYLE = { fontSize: 12, stroke: "rgba(255,255,255,0.08)" }
const AXIS_LINE_STYLE = { stroke: "rgba(255,255,255,0.08)" }

type ForecastMode = "stake" | "unstake"
type RangeKey = "1m" | "3m" | "1y"
type RangeStep = "day" | "month"
type ForecastPoint = { t: number; baseAmount: number; amountWithLiquidity: number }

const formatDayMonth = (ts: number) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
const formatMonth = (ts: number) => new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(ts))
const formatMonthYear = (ts: number) => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(ts))

const EndDot = (lastIndex: number, fill: string) =>
  function Dot(props: { cx?: number; cy?: number; index?: number }) {
    const { cx, cy, index } = props
    if (index !== lastIndex || cx == null || cy == null) return null
    return (
      <g pointerEvents="none" key={`EndDot${lastIndex}`}>
        <circle cx={cx} cy={cy} r={4.5} fill={fill} />
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

const RANGE_CONFIG: Record<
  RangeKey,
  {
    getEndDate: (start: Date) => Date
    step: RangeStep
    formatTick: (ts: number) => string
    formatTooltip: (ts: number) => string
  }
> = {
  "1m": {
    getEndDate: (start) => addMonths(start, 1),
    step: "day",
    formatTick: formatDayMonth,
    formatTooltip: formatDayMonth,
  },
  "3m": {
    getEndDate: (start) => addMonths(start, 3),
    step: "day",
    formatTick: formatDayMonth,
    formatTooltip: formatDayMonth,
  },
  "1y": {
    getEndDate: (start) => addYears(start, 1),
    step: "month",
    formatTick: formatMonth,
    formatTooltip: formatMonthYear,
  },
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

const buildForecastData = ({
  start,
  end,
  step,
  currentInvestment,
  newLiquidity,
  apy,
  currentFeature,
}: {
  start: Date
  end: Date
  step: RangeStep
  currentInvestment: number
  newLiquidity: number
  apy: number
  currentFeature: ForecastMode
}) => {
  const points: ForecastPoint[] = []
  let cursor = new Date(start)
  const adjustedInvestment = currentFeature === "stake" ? currentInvestment + newLiquidity : currentInvestment - newLiquidity

  const pushPoint = (date: Date) => {
    const t = date.getTime()
    const timeInYears = (t - start.getTime()) / MS_PER_YEAR

    points.push({
      t,
      baseAmount: Number(computedProjection(currentInvestment, timeInYears, apy).toFixed(2)),
      amountWithLiquidity: Number(computedProjection(adjustedInvestment, timeInYears, apy).toFixed(2)),
    })
  }

  while (cursor <= end) {
    pushPoint(cursor)
    cursor = step === "day" ? addDays(cursor, 1) : addMonths(cursor, 1)
  }

  if (points.at(-1)?.t !== end.getTime()) {
    pushPoint(end)
  }

  return points
}

const CustomTooltip = (props: {
  active?: boolean
  payload?: Array<{ dataKey?: string | number; value?: ValueType }>
  label?: number
  fmtLabel: (v: number) => ReactNode
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
  currentFeature: ForecastMode
}

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

    const rangeConfig = RANGE_CONFIG[range]
    const end = rangeConfig.getEndDate(now)
    const startTs = now.getTime()
    const endTs = end.getTime()
    const spanMs = endTs - startTs
    const ticks = Array.from({ length: TIME_TICK_COUNT }, (_, i) => startTs + (spanMs * i) / (TIME_TICK_COUNT - 1))

    return {
      data: buildForecastData({ start: now, end, step: rangeConfig.step, currentInvestment, newLiquidity, apy, currentFeature }),
      ticks,
      fmtTick: rangeConfig.formatTick,
      fmtTooltipLabel: rangeConfig.formatTooltip,
      startTs,
      endTs,
    }
  }, [range, currentInvestment, newLiquidity, apy, currentFeature])

  const allValues = useMemo(() => {
    const base = forecastData.map((d) => d.baseAmount)
    return newLiquidity > 0 ? base.concat(forecastData.map((d) => d.amountWithLiquidity)) : base
  }, [forecastData, newLiquidity])

  const yAxis = calculateYAxis(Math.min(...allValues), Math.max(...allValues))

  const showSecondLine = newLiquidity > 0
  const liquidityChangeSign = currentFeature === "stake" ? "+" : "-"

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

      {apy && apy > 0 ? (
        <>
          <div className="mt-2.5 flex h-[18rem] w-full">
            <ResponsiveContainer width="100%" height="100%" className="!max-h-none">
              <LineChart
                margin={{
                  top: 20,
                  right: -50,
                  left: 0,
                  bottom: 0,
                }}
                data={forecastData}
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
                  padding={{ left: 0, right: 45 }}
                  axisLine={AXIS_LINE_STYLE}
                  tickLine={false}
                  allowDataOverflow
                  height={20}
                />

                <YAxis
                  orientation="right"
                  tickFormatter={(v) => `$${formatMillions(v)}`}
                  width={CHART_Y_AXIS_WIDTH}
                  domain={[yAxis.min, yAxis.max]}
                  ticks={Array.from({ length: Math.floor((yAxis.max - yAxis.min) / yAxis.stepSize) + 1 }, (_, i) => yAxis.min + i * yAxis.stepSize)}
                  tick={({ x, y, payload }) => (
                    <text x={x - 10} y={y - 7} dy={4} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize={11}>
                      ${formatMillions(payload.value)}
                    </text>
                  )}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 2 }}
                  content={<CustomTooltip fmtLabel={fmtTooltipLabel} newLiquidity={newLiquidity} />}
                />

                <Line
                  strokeWidth={2}
                  type="monotone"
                  dataKey="baseAmount"
                  stroke="#FFFFFF"
                  name="Current Position Growth"
                  dot={EndDot(forecastData.length - 1, "#FFFFFF") as LineDot}
                  isAnimationActive={false}
                />

                {showSecondLine && (
                  <Line
                    strokeWidth={2}
                    type="monotone"
                    dataKey="amountWithLiquidity"
                    stroke="url(#gradientColor)"
                    name={`Total After ${liquidityChangeSign}${formatDollar(newLiquidity, 0)}`}
                    dot={EndDot(forecastData.length - 1, "url(#gradientColor)") as LineDot}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="mt-3 flex h-[18rem] w-full items-center justify-center text-subtitle">No APY data</div>
      )}
    </>
  )
}
