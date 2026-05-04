"use client"

import { useId } from "react"
import type { ComponentType } from "react"
import { formatDollar } from "@/lib/number_formatter"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { formatXAxis, getDataRangeMs, getXAxisTicks } from "../dashboard_controller"
import { Area, AreaChart, CartesianGrid, Customized, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type AxisWithScale = { scale: (v: number) => number }
type CustomizedChartProps = { xAxisMap: Record<string, AxisWithScale>; yAxisMap: Record<string, AxisWithScale> }
const TypedCustomized = Customized as ComponentType<{ component: (props: CustomizedChartProps) => React.ReactElement | null }>

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
  <text x={x ?? 0} y={y} dy={4} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize={11}>
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
  const badgeLabel = formatDollar(latestValue, 4)
  const badgeTextColor = token === "sUSG" ? "#05070A" : "#FFFFFF"
  const rangeMs = getDataRangeMs(data)
  const xAxisTicks = getXAxisTicks(data)

  return (
    <ReliefCard className="flex h-full w-full flex-col items-start justify-start px-5 pt-5">
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

      <div className="relative mt-4 flex h-56 min-h-56 w-full items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: -50,
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
              tickFormatter={(tick) => formatXAxis(tick, rangeMs)}
              padding={{ left: 0, right: 44 }}
            />

            <YAxis
              axisLine={false}
              orientation="right"
              ticks={yTicks}
              tickFormatter={(tick) => formatPriceTick(tick, yTickStep)}
              tick={({ x, y, payload }) => <PriceAxisTick x={x - 10} y={y - 7} value={formatPriceTick(payload.value, yTickStep)} />}
              tickLine={false}
              width={48}
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

            <TypedCustomized
              component={(props) => {
                const xScale = Object.values(props.xAxisMap)[0]?.scale
                const yScale = Object.values(props.yAxisMap)[0]?.scale
                if (!xScale || !yScale || !latestPoint) return null
                const cx = xScale(latestPoint.date)
                const cy = yScale(latestPoint.uv)
                return (
                  <foreignObject x={cx - 40} y={cy + 10} width={70} height={20} style={{ overflow: "visible" }}>
                    <div
                      style={{ backgroundColor: accentColor, color: badgeTextColor }}
                      className="w-fit whitespace-nowrap rounded-full p-[5px] text-[10px] font-semibold leading-none"
                    >
                      {badgeLabel}
                    </div>
                  </foreignObject>
                )
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ReliefCard>
  )
}
