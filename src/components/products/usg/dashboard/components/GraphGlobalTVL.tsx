"use client"

import { formatMillions } from "@/lib/number_formatter"
import { TVLData } from "../../usg_type"
import { Divider } from "@/components/design_system/structure/divider"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { cn } from "@/lib/utils"
import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart, Tooltip, CartesianGrid } from "recharts"
import { formatXAxis, formatYAxis, getDataRangeMs, getXAxisTicks } from "../dashboard_controller"
import { returnTVLType } from "../utils"
import { CustomTooltip, TooltipCategory } from "./CustomGraphTooltip"

type MarketDebtProps = {
  protocolCurrentTVL: TVLData
  tvl: TVLData[]
  tvlSelectedTab: string
  fetchTVLData: (range: string) => void
}

const TVL_CATEGORY_METADATA: Record<string, { label: string; className: string }> = {
  markets: { label: "Markets", className: "text-row-tonic" },
  pegkeepers: { label: "Peg Keepers", className: "text-dash-keepers" },
  susg: { label: "sUSG", className: "text-dash-susg" },
}

const SERIES_CONFIG = [
  { key: "markets" as keyof TVLData, stroke: "#0075ff", gradient: "tvl-marketsGradient", name: "Markets" },
  { key: "pegkeepers" as keyof TVLData, stroke: "#24DD9A", gradient: "tvl-pegKeepersGradient", name: "Peg Keepers" },
  { key: "susg" as keyof TVLData, stroke: "#4EB3DF", gradient: "tvl-susgGradient", name: "SUSG" },
]

export const GraphGlobalTVL = ({ fetchTVLData, tvlSelectedTab, protocolCurrentTVL, tvl }: MarketDebtProps) => {
  const rangeMs = getDataRangeMs(tvl)
  const xAxisTicks = getXAxisTicks(tvl)

  const sortedSeries = tvl?.length
    ? [...SERIES_CONFIG].sort((a, b) => {
        const avgA = tvl.reduce((sum, d) => sum + ((d[a.key] as number) ?? 0), 0) / tvl.length
        const avgB = tvl.reduce((sum, d) => sum + ((d[b.key] as number) ?? 0), 0) / tvl.length
        return avgA - avgB
      })
    : SERIES_CONFIG

  const sortedCategories: TooltipCategory[] = [...sortedSeries].reverse().map((s) => ({
    key: s.key as string,
    ...TVL_CATEGORY_METADATA[s.key],
  }))

  return (
    <ReliefCard className="flex h-full w-full flex-col items-start justify-start p-5">
      <div className="flex w-full items-center justify-between">
        <div className="flex text-xl font-semibold">TVL </div>

        <div className="flex gap-2">
          <ButtonTab onClick={() => fetchTVLData("1w")} label={"1w"} active={tvlSelectedTab === "1w"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchTVLData("1m")} label={"1m"} active={tvlSelectedTab === "1m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchTVLData("3m")} label={"3m"} active={tvlSelectedTab === "3m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchTVLData("1y")} label={"1y"} active={tvlSelectedTab === "1y"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchTVLData("all")} label={"all"} active={tvlSelectedTab === "all"} className="rounded-full !py-1" />
        </div>
      </div>

      <Divider />
      {/* LEGENDS */}
      {protocolCurrentTVL && protocolCurrentTVL?.total > 0 && (
        <div className="mb-1 flex w-full items-stretch justify-start gap-2 text-xs">
          <div className="flex flex-row items-start justify-start gap-2 self-stretch rounded-[10px] bg-overlay-panel p-2 md:flex-col">
            <div className="flex text-xs text-subtitle">TVL </div>

            <div className="text-xs font-semibold text-white"> {`$${formatMillions(protocolCurrentTVL?.total)}`}</div>
          </div>

          {[
            { label: "Markets", name: "markets" },
            { label: "Peg Keepers", name: "pegkeepers" },
            { label: "sUSG", name: "susg" },
          ].map((el) => (
            <div key={el?.name} className="hidden flex-col items-center gap-2 rounded-[10px] bg-overlay-panel p-2 md:flex">
              <div className="flex w-full items-center justify-between gap-2">
                <div className={cn("flex h-2 w-2 rounded-full", returnTVLType(el?.name))}></div>
                <div className="flex items-center justify-center gap-1">{el?.label}</div>
              </div>

              <div className="flex w-full items-center justify-between gap-2 font-semibold">
                {formatMillions(protocolCurrentTVL[el?.name as keyof typeof protocolCurrentTVL])}
                <span className="h-1 w-1 rounded-full bg-white"></span>
                <span>{((protocolCurrentTVL[el?.name as keyof typeof protocolCurrentTVL] / protocolCurrentTVL?.total) * 100).toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* CHART */}
      <div className="flex h-56 min-h-56 w-full items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={tvl}
            margin={{
              top: 15,
              right: -50,
              left: -5,
              bottom: -10,
            }}
          >
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => formatXAxis(tick, rangeMs)}
              ticks={xAxisTicks}
              scale="point"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
              padding={{ left: 0, right: 40 }}
            />

            <YAxis
              orientation="right"
              axisLine={false}
              tick={({ x, y, payload }) => (
                <text x={x - 10} y={y - 7} dy={4} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize={11}>
                  {formatYAxis(payload.value)}
                </text>
              )}
              tickLine={false}
              width={48}
            />
            <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.06)" />

            <defs>
              <linearGradient id="tvl-marketsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0075ff" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#0075ff" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="tvl-pegKeepersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#24DD9A" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#24DD9A" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="tvl-susgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4EB3DF" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#4EB3DF" stopOpacity={0} />
              </linearGradient>
            </defs>

            {sortedSeries.map((s) => (
              <Area key={s.key} type="monotone" dataKey={s.key} stackId="1" stroke={s.stroke} strokeWidth={1.5} fill={`url(#${s.gradient})`} name={s.name} />
            ))}

            <Tooltip
              cursor={{
                stroke: "rgba(255,255,255,0.7)",
                strokeWidth: 2,
                strokeDasharray: "4 4",
              }}
              allowEscapeViewBox={{ x: false, y: false }}
              content={<CustomTooltip categories={sortedCategories} />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ReliefCard>
  )
}
