"use client"

import { useId } from "react"
import { formatDollar } from "@/lib/number_formatter"
import { Divider } from "@/components/design_system/structure/divider"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type PricePoint = {
  date: number
  uv: number
}

type GraphTokenPriceProps = {
  token: "USG" | "sUSG"
  title: string
  selectedTab: string
  data: PricePoint[]
  fetchPriceHistoryData: (token: "USG" | "sUSG", range: string) => void
  accentColor: string
  gradientStart: string
}

const PriceTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: number }) => {
  if (!active || !payload?.length || !label) return null

  const value = Number(payload[0]?.value ?? 0)
  const date = new Date(label)
  const isoDate = date.toISOString().slice(0, 10)
  const timeLabel = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`

  return (
    <div className="flex min-w-36 flex-col gap-1 rounded-[10px] border border-white/10 bg-input p-3 backdrop-blur-[60px]">
      <div className="text-xs text-subtitle">
        {isoDate} {timeLabel}
      </div>
      <div className="text-sm font-semibold text-white">{formatDollar(value, 4)}</div>
    </div>
  )
}

const formatPriceTick = (tick: number, step: number) => {
  if (tick >= 100) return formatDollar(tick, 0)
  if (step >= 0.01) return formatDollar(tick, 2)
  if (step >= 0.001) return formatDollar(tick, 3)
  return formatDollar(tick, 4)
}

const PriceAxisTick = ({ x, y, value }: { x?: number; y?: number; value: string }) => (
  <text x={(x ?? 0) + 25} y={y} dy={4} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize={11}>
    {value}
  </text>
)

export const GraphTokenPrice = ({ token, title, selectedTab, data, fetchPriceHistoryData, accentColor, gradientStart }: GraphTokenPriceProps) => {
  const gradientId = useId().replace(/:/g, "")
  const latestPoint = data.at(-1)
  const latestValue = latestPoint?.uv ?? 0
  const values = data.map((point) => point.uv)
  const minValue = values.length ? Math.min(...values) : 0
  const maxValue = values.length ? Math.max(...values) : 0
  const spread = Math.max(maxValue - minValue, 0.0001)
  const padding = Math.max(spread * 0.2, 0.0001)
  const domainMin = minValue - padding
  const domainMax = maxValue + padding
  const yTickCount = 5
  const yTickStep = (domainMax - domainMin) / (yTickCount - 1)
  const yTicks = Array.from({ length: yTickCount }, (_, index) => domainMin + yTickStep * index)
  const badgeTopPercent = domainMax === domainMin ? 50 : ((domainMax - latestValue) / (domainMax - domainMin)) * 100 - 10
  const badgeLabel = formatDollar(latestValue, 4)
  const badgeTextColor = token === "sUSG" ? "#05070A" : "#FFFFFF"
  const hasMultipleYears = new Set(data.map((point) => new Date(point.date).getFullYear())).size > 1
  const xAxisTicks = data.reduce<number[]>((ticks, point) => {
    const dayKey = new Date(point.date).toISOString().slice(0, 10)
    const lastTick = ticks[ticks.length - 1]
    const lastDayKey = lastTick ? new Date(lastTick).toISOString().slice(0, 10) : null

    if (dayKey !== lastDayKey) {
      ticks.push(point.date)
    }

    return ticks
  }, [])

  const formatAxisDate = (timestamp: number) => {
    const date = new Date(timestamp)

    return date.toLocaleDateString(undefined, {
      year: hasMultipleYears ? "2-digit" : undefined,
      month: "short",
      day: "numeric",
    })
  }

  return (
    <ReliefCard className="flex h-full w-full flex-col items-start justify-start p-5">
      <div className="flex w-full items-center justify-between">
        <div className="text-xl font-semibold">{title}</div>

        <div className="flex gap-2">
          <ButtonTab onClick={() => fetchPriceHistoryData(token, "1d")} label={"1d"} active={selectedTab === "1d"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchPriceHistoryData(token, "1w")} label={"1w"} active={selectedTab === "1w"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchPriceHistoryData(token, "1m")} label={"1m"} active={selectedTab === "1m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchPriceHistoryData(token, "1y")} label={"1y"} active={selectedTab === "1y"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchPriceHistoryData(token, "all")} label={"all"} active={selectedTab === "all"} className="rounded-full !py-1" />
        </div>
      </div>

      <Divider />

      <div className="relative flex h-56 min-h-56 w-full items-center justify-center">
        {latestPoint && (
          <div
            className="pointer-events-none absolute right-3 z-10 -translate-y-1/2 rounded-full px-2 py-1 text-[10px] font-semibold leading-none"
            style={{
              top: `${Math.min(80, Math.max(6, badgeTopPercent))}%`,
              backgroundColor: accentColor,
              color: badgeTextColor,
            }}
          >
            {badgeLabel}
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 6,
              left: 0,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientStart} stopOpacity={0.35} />
                <stop offset="100%" stopColor={gradientStart} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.04)" />

            <XAxis
              dataKey="date"
              ticks={xAxisTicks}
              minTickGap={24}
              tickMargin={8}
              scale="point"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
              tickFormatter={formatAxisDate}
            />

            <YAxis
              axisLine={false}
              orientation="right"
              ticks={yTicks}
              tickFormatter={(tick) => formatPriceTick(tick, yTickStep)}
              tick={({ x, y, payload }) => <PriceAxisTick x={x + 20} y={y} value={formatPriceTick(payload.value, yTickStep)} />}
              tickLine={false}
              //width={72}
              domain={[domainMin, domainMax]}
            />

            <Tooltip
              cursor={{
                stroke: "rgba(255,255,255,0.65)",
                strokeWidth: 1.5,
                strokeDasharray: "4 4",
              }}
              allowEscapeViewBox={{ x: false, y: false }}
              content={<PriceTooltip />}
            />

            <Area
              type="monotone"
              dataKey="uv"
              stroke={accentColor}
              strokeWidth={2}
              fill={`url(#${gradientId}-fill)`}
              dot={false}
              activeDot={{ r: 4, fill: accentColor, stroke: accentColor }}
            />

            {latestPoint && <ReferenceDot x={latestPoint.date} y={latestPoint.uv} r={4} fill={accentColor} stroke={accentColor} isFront={true} />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ReliefCard>
  )
}
