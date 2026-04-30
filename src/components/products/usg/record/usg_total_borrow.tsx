"use client"

import { formatCompact, formatDollar } from "@/lib/number_formatter"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

type UsgTotalBorrowProps = {
  totalBorrow: Array<{
    timestamp: string
    value: string
  }>
}

const Y_AXIS_STEPS = [25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000]

const getAdaptiveYAxisStep = (maxValue: number) => {
  if (maxValue <= 0) return 250_000

  // Keep the axis on "nice" financial steps while targeting roughly 4 visible intervals.
  const targetTickCount = 4
  const minimumStep = maxValue / targetTickCount

  return Y_AXIS_STEPS.find((step) => step >= minimumStep) ?? Y_AXIS_STEPS[Y_AXIS_STEPS.length - 1]
}

const PriceAxisTick = ({ x, y, value }: { x?: number; y?: number; value: string }) => (
  <text x={(x ?? 0) - 8} y={y} dy={4} textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize={11}>
    ${value}
  </text>
)

export default function UsgTotalBorrow({ totalBorrow }: UsgTotalBorrowProps) {
  const maxBorrowValue = totalBorrow.length > 0 ? Math.max(...totalBorrow.map((d) => Number(d?.value))) : 0

  // The Y scale is explicit rather than fully automatic:
  // - use round monetary steps so the grid stays easy to read
  // - round the max up to the next step so the area has headroom
  // - switch label formatting between K and M depending on magnitude
  const yAxisStep = getAdaptiveYAxisStep(maxBorrowValue)
  const yAxisMax = Math.max(yAxisStep, Math.ceil(maxBorrowValue / yAxisStep) * yAxisStep)
  const yAxisTicks = Array.from({ length: Math.floor(yAxisMax / yAxisStep) + 1 }, (_, index) => index * yAxisStep)
  const xAxisTicks = totalBorrow.reduce<string[]>((ticks, point) => {
    const dayKey = new Date(point.timestamp).toISOString().slice(0, 10)
    const lastTick = ticks[ticks.length - 1]
    const lastDayKey = lastTick ? new Date(lastTick).toISOString().slice(0, 10) : null

    if (dayKey !== lastDayKey) {
      ticks.push(point.timestamp)
    }

    return ticks
  }, [])

  const formatAxisDate = (timestamp: string) => {
    const date = new Date(timestamp)

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  }

  const formatYAxisValue = (value: number) => {
    if (value === 0) return "$0"

    if (value < 250_000) {
      return `$${Number((value / 1_000).toFixed(0)).toString()}K`
    }

    const valueInMillions = value / 1_000_000
    return `$${Number(valueInMillions.toFixed(2)).toString()}M`
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={totalBorrow}
        margin={{
          top: 12,
          right: -60,
          left: 0,
          bottom: 15,
        }}
      >
        <defs>
          <linearGradient id="borrowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid horizontal={true} vertical={false} stroke="#FFFFFF1A" />
        <XAxis
          dataKey="timestamp"
          ticks={xAxisTicks}
          minTickGap={24}
          tickMargin={8}
          padding={{ right: 38 }}
          tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatAxisDate}
        />

        <YAxis
          ticks={yAxisTicks}
          domain={[0, yAxisMax]}
          orientation="right"
          className="text-xs"
          axisLine={false}
          tickLine={false}
          tick={({ x, y, payload }) => <PriceAxisTick x={x} y={y - 7} value={formatCompact(payload.value)} />}
          tickFormatter={formatYAxisValue}
        />

        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const formattedValue = formatDollar(Number(payload[0]?.value || 0).toFixed(0), 0)
              const formattedDate = new Date(label).toISOString().slice(0, 16).replace("T", " ")

              return (
                <div className="flex flex-col items-center justify-center rounded-[10px] border border-white border-opacity-10 bg-input p-2 text-white backdrop-blur-[60px]">
                  <div className="flex w-full items-center justify-between">
                    <p className="min-w-24 font-semibold">Total Borrow:</p>
                    {formattedValue}
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <p className="min-w-24 font-semibold">Date:</p>
                    {formattedDate}
                  </div>
                </div>
              )
            }

            return null
          }}
        />
        <Area type="monotone" dataKey="value" stroke="#1568ed" strokeWidth={1.5} fill="url(#borrowGradient)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
