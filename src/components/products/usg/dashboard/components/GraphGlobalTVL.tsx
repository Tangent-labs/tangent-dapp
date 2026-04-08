import { formatMillions } from "@/lib/number_formatter"
import { TVLData } from "../../usg_type"
import { Divider } from "@/components/design_system/structure/divider"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { cn } from "@/lib/utils"
import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart, Tooltip, CartesianGrid } from "recharts"
import { formatXAxis, formatYAxis, getDataRangeMs, getTickInterval } from "../dashboard_controller"
import { returnTVLType } from "../utils"
import { CustomTooltip, TooltipCategory } from "./CustomGraphTooltip"

type MarketDebtProps = {
  protocolCurrentTVL: TVLData
  tvl: TVLData[]
  tvlSelectedTab: string
  fetchTVLData: (range: string) => void
}
const TVL_CATEGORIES: TooltipCategory[] = [
  { key: "markets", label: "Markets", className: "text-row-tonic" },
  { key: "pegkeepers", label: "Peg Keepers", className: "text-dash-keepers" },
  { key: "susg", label: "sUSG", className: "text-dash-susg" },
]
export const GraphGlobalTVL = ({ fetchTVLData, tvlSelectedTab, protocolCurrentTVL, tvl }: MarketDebtProps) => {
  const rangeMs = getDataRangeMs(tvl)
  const tickInterval = getTickInterval(tvl.length)
  return (
    <div className="flex w-full flex-col items-start justify-start gap-3 md:flex-row">
      <div className="flex w-full items-start justify-start">
        <ReliefCard className="flex h-full w-full flex-col items-start justify-start p-5">
          <div className="flex w-full items-center justify-end sm:justify-between">
            <div className="hidden text-xl font-semibold sm:flex">TVL </div>

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
                  top: 10,
                  right: -20,
                  left: -5,
                  bottom: -10,
                }}
              >
                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) => formatXAxis(tick, rangeMs)}
                  interval={tickInterval}
                  scale="point"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                />

                <YAxis
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
                  tickLine={false}
                  width={60}
                />
                <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.06)" />

                <defs>
                  <linearGradient id="marketsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0075ff" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#0075ff" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="pegKeepersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#24DD9A" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#24DD9A" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="susgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4EB3DF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#4EB3DF" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <Area type="monotone" dataKey="susg" stackId="1" stroke="#4EB3DF" strokeWidth={1.5} fill="url(#susgGradient)" name="SUSG" />

                <Area type="monotone" dataKey="pegkeepers" stackId="1" stroke="#24DD9A" strokeWidth={1.5} fill="url(#pegKeepersGradient)" name="Peg Keepers" />

                <Area type="monotone" dataKey="markets" stackId="1" stroke="#0075ff" strokeWidth={1.5} fill="url(#marketsGradient)" name="Markets" />

                <Tooltip
                  cursor={{
                    stroke: "rgba(255,255,255,0.7)",
                    strokeWidth: 2,
                    strokeDasharray: "4 4",
                  }}
                  allowEscapeViewBox={{ x: false, y: false }}
                  content={<CustomTooltip categories={TVL_CATEGORIES} />}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ReliefCard>
      </div>
    </div>
  )
}
