import { formatMillions } from "@/lib/number_formatter"
import { Divider } from "@/components/design_system/structure/divider"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart, Tooltip, CartesianGrid } from "recharts"
import { formatXAxis, formatYAxis, getDataRangeMs, getTickInterval } from "../dashboard_controller"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { CustomTooltip, TooltipCategory } from "./CustomGraphTooltip"

type MarketDebtProps = {
  USGCurrentSupply: number
  sUSGCurrentSupply: number
  USGsUSGTotalSupplyData: {
    date: number
    usg?: number | null | undefined
    susg?: number | null | undefined
  }[]
  totalSupplySelectedTab: string
  fetchTotalSupplyData: (range: string) => void
}

const SUPPLY_CATEGORIES: TooltipCategory[] = [
  { key: "usg", label: "USG", className: "text-button-active" },
  { key: "susg", label: "sUSG", className: "text-tonic" },
]

export const GraphUSGsUSG = ({
  fetchTotalSupplyData,
  totalSupplySelectedTab,
  sUSGCurrentSupply,
  USGCurrentSupply,
  USGsUSGTotalSupplyData,
}: MarketDebtProps) => {
  const rangeMs = getDataRangeMs(USGsUSGTotalSupplyData)
  const tickInterval = getTickInterval(USGsUSGTotalSupplyData.length)
  return (
    <ReliefCard className="flex h-full w-full flex-col items-start justify-start p-5">
      {/* TITLE AND BUTTONS */}
      <div className="flex w-full items-center justify-end sm:justify-between">
        <div className="hidden text-xl font-semibold sm:flex">Total Supply </div>

        <div className="flex gap-2">
          <ButtonTab onClick={() => fetchTotalSupplyData("1w")} label={"1w"} active={totalSupplySelectedTab === "1w"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchTotalSupplyData("1m")} label={"1m"} active={totalSupplySelectedTab === "1m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchTotalSupplyData("3m")} label={"3m"} active={totalSupplySelectedTab === "3m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchTotalSupplyData("1y")} label={"1y"} active={totalSupplySelectedTab === "1y"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchTotalSupplyData("all")} label={"all"} active={totalSupplySelectedTab === "all"} className="rounded-full !py-1" />
        </div>
      </div>

      <Divider />

      {/* LEGEND */}
      <div className="mb-1 flex w-full items-stretch justify-start gap-2 text-xs">
        <div className="flex flex-row items-start justify-start gap-2 self-stretch rounded-[10px] bg-overlay-panel p-2 md:flex-col">
          <div className="flex text-xs text-subtitle sm:hidden">Total supply </div>
          <div className="hidden text-xs text-subtitle sm:flex">Total </div>

          <div className="text-xs font-semibold text-white"> {`$${formatMillions(USGCurrentSupply)}`}</div>
        </div>

        {USGCurrentSupply > 0 && (
          <div className="hidden flex-col items-center gap-2 rounded-[10px] bg-overlay-panel p-2 md:flex">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex h-2 w-2 rounded-full bg-button-active"></div>

              <div className="flex items-center justify-center gap-1">
                <TokenImage token="USG" size={16} />
                USG
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-2 font-semibold">
              <span>{formatMillions(USGCurrentSupply)}</span>
              <span className="h-1 w-1 rounded-full bg-white"></span>
              <span>{((USGCurrentSupply / (sUSGCurrentSupply + USGCurrentSupply)) * 100).toFixed(2)}%</span>
            </div>
          </div>
        )}

        {sUSGCurrentSupply > 0 && (
          <div className="hidden flex-col items-center gap-2 rounded-[10px] bg-overlay-panel p-2 md:flex">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex h-2 w-2 rounded-full bg-tonic"></div>

              <div className="flex items-center justify-center gap-1">
                <TokenImage token="sUSG" size={16} />
                sUSG
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-2 font-semibold">
              <span>{formatMillions(sUSGCurrentSupply)}</span>
              <span className="h-1 w-1 rounded-full bg-white"></span>
              <span>{((sUSGCurrentSupply / (sUSGCurrentSupply + USGCurrentSupply)) * 100).toFixed(2)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* CHART */}
      <div className="flex h-56 min-h-56 w-full items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={USGsUSGTotalSupplyData}
            margin={{
              top: 10,
              right: 4,
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
              orientation="right"
              axisLine={false}
              tick={({ x, y, payload }) => (
                <text x={x + 44} y={y} dy={4} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize={11}>
                  {formatYAxis(payload.value)}
                </text>
              )}
              tickLine={false}
              width={48}
            />

            <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.06)" />
            <defs>
              <linearGradient id="supply-susgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(252, 248, 47, 0.3)" />
                <stop offset="100%" stopColor="rgba(251, 249, 17, 0)" />
              </linearGradient>

              <linearGradient id="supply-usgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0, 117, 255, 0.3)" />
                <stop offset="100%" stopColor="rgba(0, 117, 255, 0)" />
              </linearGradient>
            </defs>

            <Area
              strokeWidth={1.5}
              type="monotone"
              dataKey="susg"
              stroke="rgba(251, 249, 17, 0.8)"
              fill="url(#supply-susgGradient)"
              name="sUSG Total Supply"
              connectNulls
            />

            <Area
              strokeWidth={1.5}
              type="monotone"
              dataKey="usg"
              stroke="rgba(0, 117, 255, 0.8)"
              fill="url(#supply-usgGradient)"
              name="USG Total Supply"
              connectNulls
            />

            <Tooltip
              cursor={{
                stroke: "rgba(255,255,255,0.7)",
                strokeWidth: 2,
                strokeDasharray: "4 4",
              }}
              allowEscapeViewBox={{ x: false, y: false }}
              content={<CustomTooltip categories={SUPPLY_CATEGORIES} />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ReliefCard>
  )
}
