"use client"

import { ReactNode, useMemo, useState } from "react"
import { formatDollar } from "@/lib/number_formatter"
import { LineDot } from "recharts/types/cartesian/Line"
import Panel from "@/components/design_system/structure/panel"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import TokenImage from "@/components/design_system/structure/token_image"
import { ValueType } from "recharts/types/component/DefaultTooltipContent"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"

const endDot = (lastIndex: number) =>
  function renderEndDot(cx: number, cy: number, index: number) {
    if (index !== lastIndex || cx == null || cy == null) return null
    return (
      <g pointerEvents="none">
        <circle cx={cx} cy={cy} r={8} fill="rgba(0,0,0,0.55)" />
        <circle cx={cx} cy={cy} r={6} fill="#FFFFFF" />
      </g>
    )
  }

const endDotGradient = (lastIndex: number) =>
  function renderEndDot(cx: number, cy: number, index: number) {
    if (index !== lastIndex || cx == null || cy == null) return null
    return (
      <g pointerEvents="none">
        <circle cx={cx} cy={cy} r={8} fill="rgba(0,0,0,0.55)" />
        <circle cx={cx} cy={cy} r={6} fill="url(#gradientColor)" />
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
  const stepSize = stepSizes.find((step) => range / step < 6) || stepSizes[stepSizes.length - 1]
  const min = Math.floor(minValue / stepSize) * stepSize
  const max = Math.ceil(maxValue / stepSize) * stepSize
  return { min, max, stepSize }
}

const CustomTooltip = (props: {
  active?: boolean | undefined
  payload?: Array<{ dataKey?: string | number | undefined; value?: ValueType | undefined }> | undefined
  label?: number
  fmtLabel: (v: number) => ReactNode
}) => {
  if (!props?.active || !props?.payload || props?.payload.length === 0) return null
  const base = props?.payload.find((p: { dataKey?: string | number | undefined; value?: ValueType | undefined }) => p.dataKey === "baseAmount")
  const liq = props?.payload.find((p: { dataKey?: string | number | undefined; value?: ValueType | undefined }) => p.dataKey === "amountWithLiquidity")
  return (
    <div className="pointer-events-none rounded-xl bg-black/70 px-3 py-2 shadow-xl ring-1 ring-white/20 backdrop-blur">
      <div className="mb-1 text-[10px] uppercase tracking-wide text-white/60">{props?.fmtLabel(Number(props?.label))}</div>
      <div className="flex flex-col gap-1">
        {base && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-white" />
            <span className="text-xs text-white/70">Base</span>
            <span className="text-sm font-semibold">{formatDollar(Number(base.value))}</span>
          </div>
        )}
        {liq && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: "linear-gradient(90deg,#FBF911 0%,#99FF00 100%)" }} />
            <span className="text-xs text-white/70">Base + Liquidity</span>
            <span className="text-sm font-semibold">{formatDollar(Number(liq.value))}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface ForecastGraphProps {
  initialInvestment: number
  apr: number
  additionalLiquidity: number
}

type RangeKey = "week" | "month" | "year" | "twoYears"

export const ForecastGraph = ({ initialInvestment, apr, additionalLiquidity }: ForecastGraphProps) => {
  const [range, setRange] = useState<RangeKey>("year")

  const {
    data: forecastData,
    ticks,
    fmtTick,
    fmtTooltipLabel,
  } = useMemo(() => {
    const now = new Date()
    const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000
    const n = 26 // compounding periods/year

    let end: Date
    let step: "day" | "week" | "month"
    let tickEveryDays = 1
    let tickEveryMonths = 1

    // label formatters
    let tickFormatter: (ts: number) => string
    let tooltipFormatter: (ts: number) => string

    switch (range) {
      case "week":
        end = addDays(now, 7)
        step = "day"
        tickEveryDays = 1
        tickFormatter = (ts) => new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric" }).format(new Date(ts))
        tooltipFormatter = (ts) => new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", month: "short" }).format(new Date(ts))
        break
      case "month":
        end = addMonths(now, 1)
        step = "day" // daily points for smoothness
        tickEveryDays = 7 // weekly ticks
        tickFormatter = (ts) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
        tooltipFormatter = (ts) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
        break
      case "year":
        end = addYears(now, 1)
        step = "month"
        tickEveryMonths = 1 // every month
        tickFormatter = (ts) => new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(ts))
        tooltipFormatter = (ts) => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(ts))
        break
      case "twoYears":
        end = addYears(now, 2)
        step = "month"
        tickEveryMonths = 2 // every 2 months (cleaner)
        tickFormatter = (ts) => new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(new Date(ts))
        tooltipFormatter = (ts) => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(ts))
        break
    }

    // build x points
    const points: Array<{ t: number; baseAmount: number; amountWithLiquidity: number }> = []
    const ticks: number[] = []
    let cursor = new Date(now)

    const pushPoint = (d: Date) => {
      const t = d.getTime()
      const timeInYears = (t - now.getTime()) / YEAR_MS
      const base = initialInvestment * Math.pow(1 + apr / 100 / n, n * timeInYears)
      const withLiq = (initialInvestment + additionalLiquidity) * Math.pow(1 + apr / 100 / n, n * timeInYears)
      points.push({ t, baseAmount: Number(base.toFixed(2)), amountWithLiquidity: Number(withLiq.toFixed(2)) })
    }

    const pushTicksDays = (every: number) => {
      let td = new Date(now)
      while (td <= end) {
        ticks.push(td.getTime())
        td = addDays(td, every)
      }
    }
    const pushTicksMonths = (every: number) => {
      let tm = new Date(now.getFullYear(), now.getMonth(), 1)
      const final = new Date(end.getFullYear(), end.getMonth(), 1)
      while (tm <= final) {
        ticks.push(tm.getTime())
        tm = addMonths(tm, every)
      }
    }

    // sample series
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

    return {
      data: points,
      ticks,
      fmtTick: tickFormatter,
      fmtTooltipLabel: tooltipFormatter,
    }
  }, [range, initialInvestment, apr, additionalLiquidity])

  // ----- Y axis numbers
  const allValues = useMemo(() => {
    const a = forecastData.map((d) => d.baseAmount)
    const b = forecastData.map((d) => d.amountWithLiquidity)
    return additionalLiquidity > 0 ? a.concat(b) : a
  }, [forecastData, additionalLiquidity])

  const yAxis = calculateYAxis(Math.min(...allValues), Math.max(...allValues))

  // ----- render
  const showSecondLine = additionalLiquidity > 0

  return (
    <>
      <div className="flex h-8 w-full items-center justify-between">
        <div className="flex items-center justify-start gap-2">
          <div className="flex w-fit items-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-2 backdrop-blur-[60px]">
            <TokenImage token="sUSG" size={16} />
            <span className="text-sm font-semibold leading-3">sUSG</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-button-active px-4 py-1">
            <span className="text-lg font-semibold">{apr}%</span>
          </div>
        </div>

        <div className="flex items-end justify-end gap-2">
          <ButtonTab
            onClick={() => setRange("week")}
            label="1w"
            active={range === "week"}
            className={`cursor-pointer rounded-[10px] border-2 border-white/30 px-4 py-1 text-xs ${range === "week" ? "bg-white text-black" : ""}`}
          />
          <ButtonTab
            onClick={() => setRange("month")}
            label="1m"
            active={range === "month"}
            className={`cursor-pointer rounded-[10px] border-2 border-white/30 px-4 py-1 text-xs ${range === "month" ? "bg-white text-black" : ""}`}
          />
          <ButtonTab
            onClick={() => setRange("year")}
            label="1y"
            active={range === "year"}
            className={`cursor-pointer rounded-[10px] border-2 border-white/30 px-4 py-1 text-xs ${range === "year" ? "bg-white text-black" : ""}`}
          />
          <ButtonTab
            onClick={() => setRange("twoYears")}
            label="2y"
            active={range === "twoYears"}
            className={`cursor-pointer rounded-[10px] border-2 border-white/30 px-4 py-1 text-xs ${range === "twoYears" ? "bg-white text-black" : ""}`}
          />
        </div>
      </div>

      <Panel className="mt-3 flex h-full w-full items-center justify-center !pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart margin={{ top: 12, right: 16, bottom: 8, left: 8 }} data={forecastData}>
            <CartesianGrid horizontal vertical={false} />

            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={[forecastData[0]?.t * 0.999, forecastData[forecastData.length - 1]?.t * 1.001]}
              ticks={ticks}
              tickFormatter={fmtTick}
              tickMargin={8}
              minTickGap={10}
              allowDataOverflow
            />

            <YAxis
              orientation="right"
              tickFormatter={(v) => `$${v}`}
              domain={[yAxis.min, yAxis.max]}
              ticks={Array.from({ length: (yAxis.max - yAxis.min) / yAxis.stepSize + 1 }, (_, i) => yAxis.min + i * yAxis.stepSize)}
            />

            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }}
              allowEscapeViewBox={{ x: true, y: true }}
              content={(props) => <CustomTooltip {...props} fmtLabel={fmtTooltipLabel} />}
            />
            <Legend />
            <Line
              strokeWidth={2}
              type="monotone"
              dataKey="baseAmount"
              stroke="#FFFFFF"
              name="Base Investment (USD)"
              dot={endDot(forecastData.length - 1) as LineDot}
              isAnimationActive={false}
            />

            {showSecondLine && (
              <Line
                strokeWidth={2}
                type="monotone"
                dataKey="amountWithLiquidity"
                stroke="url(#gradientColor)"
                name="Investment + Additional Liquidity (USD)"
                dot={endDotGradient(forecastData.length - 1) as LineDot}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <svg width="0" height="0">
          <defs>
            <linearGradient id="gradientColor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBF911" />
              <stop offset="100%" stopColor="#99FF00" />
            </linearGradient>
          </defs>
        </svg>
      </Panel>
    </>
  )
}
