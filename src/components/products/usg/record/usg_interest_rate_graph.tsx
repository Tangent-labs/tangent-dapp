"use client"

import { useEffect, useState } from "react"
import { formatUnits, parseUnits } from "viem"
import { computeIR, computeRewardsCut } from "./usg_record_controller"
import { useUSGRecordContext } from "./usg_record_context"
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Area, Tooltip, ReferenceLine } from "recharts"
import { isVolatileCollateral } from "@/lib/risk_color"
import { UI_V2 } from "@/v2/ui"

const TICK = UI_V2 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.6)"
const IR_COLOR = UI_V2 ? "#EDEDEF" : "#95FF00"
const IR_FILL = UI_V2 ? "237,237,239" : "149,255,0"
const GRID = UI_V2 ? "rgba(255,255,255,0.05)" : "#FFFFFF1A"

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: number
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="flex flex-col items-start justify-center gap-1 rounded-[10px] border border-white border-opacity-10 bg-input p-2 text-xs text-white backdrop-blur-[60px]">
      <span className="text-xs text-white">Price: ${(label ?? 0).toFixed(5)}</span>
      {payload.map((entry) => (
        <div key={entry?.dataKey} className="flex items-center justify-center gap-2">
          <span className="h-[10px] w-[10px] rounded-[3px]" style={{ background: entry.color }}></span>
          <span>
            {entry.dataKey === "rewardsCut" ? "Rewards Cut" : "Interest Rate"}: {entry.value.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  )
}

const RewardsCutAxisTick = ({ x, y, value }: { x?: number; y?: number; value: string }) => (
  <text x={(x ?? 0) + 8} y={y} dy={4} textAnchor="start" fill={TICK} fontSize={11}>
    {value}%
  </text>
)

const InterestRateAxisTick = ({ x, y, value }: { x?: number; y?: number; value: string }) => (
  <text x={(x ?? 0) - 8} y={y} dy={4} textAnchor="end" fill={TICK} fontSize={11}>
    {value}%
  </text>
)

export function InterestRateGraph() {
  const { marketData, marketInfo, USGInfo } = useUSGRecordContext()
  const maxInterestRate = isVolatileCollateral(marketInfo.marketName) ? 400 : 200
  const interestRateTicks = maxInterestRate === 400 ? [0, 100, 200, 300, 400] : [0, 50, 100, 150, 200]

  interface ChartData {
    price: number
    interestRate: number
    rewardsCut: number
  }

  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    if (!marketData?.constants?.irParams || !marketData?.constants?.rcParams) return

    const { irParams, rcParams } = marketData.constants

    const startPrice = 1.0
    const endPrice = 0.98
    const numPoints = 100
    const step = (startPrice - endPrice) / (numPoints - 1)

    const data: ChartData[] = []

    for (let i = 0; i < numPoints; i++) {
      const price = startPrice - i * step

      const priceInWei = parseUnits(price.toFixed(6), 18)
      const irInWei = computeIR(priceInWei, irParams)

      const irPercent = Number(formatUnits(irInWei, 18)) * 100
      const rewardsCutPercent = computeRewardsCut(priceInWei, rcParams)

      data.push({
        price: Number(price.toFixed(4)),
        interestRate: Number(irPercent.toFixed(2)),
        rewardsCut: Number(formatUnits(rewardsCutPercent, 3)),
      })
    }

    setChartData(data)
  }, [marketData])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{
          top: 12,
          right: -60,
          left: -60,
          bottom: 12,
        }}
      >
        <defs>
          <linearGradient id="gradiant-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,117,255,0.3)" stopOpacity={1} />
            <stop offset="50%" stopColor="rgba(0,117,255,0.05)" stopOpacity={1} />
            <stop offset="100%" stopColor="rgba(0,117,255,0)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradiant-yellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgba(${IR_FILL},${UI_V2 ? 0.14 : 0.3})`} stopOpacity={1} />
            <stop offset="50%" stopColor={`rgba(${IR_FILL},0.03)`} stopOpacity={1} />
            <stop offset="100%" stopColor={`rgba(${IR_FILL},0)`} stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="price"
          type="number"
          reversed
          className="text-sm"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => value.toFixed(4)}
          ticks={[1.0, 0.9975, 0.995, 0.9925, 0.99, 0.9875, 0.985, 0.9825, 0.98]}
          domain={[0.98, 1.0]}
          padding={{ left: 25, right: 30 }}
          textAnchor="middle"
          tick={{ fontSize: UI_V2 ? 11 : 12, fill: TICK }}
          tickMargin={8}
        />

        <YAxis
          yAxisId="left"
          dataKey="rewardsCut"
          className="text-xs"
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tick={({ x, y, payload }) => <RewardsCutAxisTick x={x} y={y - 7} value={payload.value} />}
        />

        <YAxis
          yAxisId="right"
          dataKey="interestRate"
          orientation="right"
          className="text-xs"
          axisLine={false}
          tickLine={false}
          domain={[0, maxInterestRate]}
          ticks={interestRateTicks}
          tick={({ x, y, payload }) => <InterestRateAxisTick x={x} y={y - 7} value={payload.value} />}
        />

        <CartesianGrid horizontal={true} vertical={false} stroke={GRID} />

        <Tooltip content={<CustomTooltip />} />

        <ReferenceLine
          yAxisId="right"
          x={USGInfo?.price}
          stroke="rgba(255,255,255,0.6)"
          strokeDasharray="3 3"
          label={{
            value: `$${(USGInfo?.price ?? 1).toFixed(4)}`,
            position: "insideTopRight",
            fill: TICK,
            fontSize: 11,
          }}
        />

        <Area yAxisId="left" type="stepAfter" dataKey="rewardsCut" stroke="#0075FF" strokeWidth={1.5} fill="url(#gradiant-blue)" fillOpacity={1} />

        <Area
          yAxisId="right"
          type="monotone"
          dataKey="interestRate"
          stroke={IR_COLOR}
          strokeWidth={1.5}
          fill="url(#gradiant-yellow)"
          fillOpacity={1}
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
