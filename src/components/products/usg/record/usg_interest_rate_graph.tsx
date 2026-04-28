"use client"

import { useEffect, useState } from "react"
import { formatUnits, parseUnits } from "viem"
import { computeIR } from "./usg_record_controller"
import { useUSGRecordContext } from "./usg_record_context"
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Legend, Area, Tooltip } from "recharts"

const RewardsCutAxisTick = ({ x, y, value }: { x?: number; y?: number; value: string }) => (
  <text x={(x ?? 0) - 26} y={y} dy={4} textAnchor="start" fill="#0075FF" fontSize={11}>
    {value}%
  </text>
)

const InterestRateAxisTick = ({ x, y, value }: { x?: number; y?: number; value: string }) => (
  <text x={(x ?? 0) + 24} y={y} dy={4} textAnchor="end" fill="#e5ff00" fontSize={11}>
    {value}%
  </text>
)

export function InterestRateGraph() {
  const { marketData } = useUSGRecordContext()

  interface RCParams {
    endCutPercentage: bigint
    endCutPrice: bigint
    harvestFeePercentage: bigint
    startCutPercentage: bigint
    startCutPrice: bigint
    stepAmount: number
  }

  interface ChartData {
    price: number
    interestRate: number
    rewardsCut: number
  }

  const [chartData, setChartData] = useState<ChartData[]>([])

  const computeRewardsCut = (USGPrice: bigint, rcParams: RCParams) => {
    const stepAmount = rcParams.stepAmount
    const startCutPrice = rcParams.startCutPrice * BigInt(10 ** 12)
    const endCutPrice = rcParams.endCutPrice * BigInt(10 ** 12)
    const USGPriceScaled = USGPrice as bigint

    if (stepAmount === 1) {
      return rcParams.startCutPercentage
    } else if (stepAmount === 2) {
      if (USGPriceScaled >= startCutPrice) {
        return rcParams.startCutPercentage
      } else {
        return rcParams.endCutPercentage
      }
    } else {
      if (USGPriceScaled >= startCutPrice) {
        return rcParams.startCutPercentage
      }
      if (USGPriceScaled <= endCutPrice) {
        return rcParams.endCutPercentage
      }

      const actualStep = BigInt(1) + (BigInt(stepAmount - 2) * (startCutPrice - USGPriceScaled)) / (startCutPrice - endCutPrice)

      return (
        BigInt(rcParams.startCutPercentage) + (BigInt(actualStep) * BigInt(rcParams.endCutPercentage - rcParams.startCutPercentage)) / BigInt(stepAmount - 1)
      )
    }
  }

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
          top: 10,
          right: -22,
          left: -30,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="gradiant-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,117,255,0.3)" stopOpacity={1} />
            <stop offset="50%" stopColor="rgba(0,117,255,0.05)" stopOpacity={1} />
            <stop offset="100%" stopColor="rgba(0,117,255,0)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradiant-yellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(251,249,17,0.3)" stopOpacity={1} />
            <stop offset="50%" stopColor="rgba(251,249,17,0.05)" stopOpacity={1} />
            <stop offset="100%" stopColor="rgba(251,249,17,0)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="price"
          type="number"
          reversed
          className="text-sm"
          axisLine={{ stroke: "#454545" }}
          tickLine={false}
          tickFormatter={(value) => value.toFixed(4)}
          ticks={[1.0, 0.9975, 0.995, 0.9925, 0.99, 0.9875, 0.985, 0.9825, 0.98]}
          domain={[0.98, 1.0]}
          textAnchor="middle"
          tick={{ fontSize: 12 }}
          tickMargin={8}
        />

        <YAxis
          yAxisId="left"
          dataKey="rewardsCut"
          className="text-xs"
          axisLine={{ stroke: "#454545" }}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
          tick={({ x, y, payload }) => <RewardsCutAxisTick x={x + 5} y={y} value={payload.value} />}
        />

        <YAxis
          yAxisId="right"
          dataKey="interestRate"
          orientation="right"
          className="text-xs"
          axisLine={{ stroke: "#454545" }}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
          domain={[0, 160]}
          tick={({ x, y, payload }) => <InterestRateAxisTick x={x + 5} y={y} value={payload.value} />}
        />

        <CartesianGrid horizontal={true} vertical={false} stroke="#454545" strokeOpacity={0.3} />

        <Legend verticalAlign="top" height={36} formatter={(value) => (value === "rewardsCut" ? "Rewards cut 90%" : "Interest rate 10%")} />

        <Tooltip
          contentStyle={{ backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px" }}
          itemStyle={{ color: "#fff" }}
          formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name === "rewardsCut" ? "Rewards Cut" : "Interest Rate"]}
          labelFormatter={(label: number) => `Price: $${label.toFixed(5)}`}
        />

        <Area yAxisId="left" type="stepAfter" dataKey="rewardsCut" stroke="#0075FF" strokeWidth={1.5} fill="url(#gradiant-blue)" fillOpacity={1} />

        <Area
          yAxisId="right"
          type="monotone"
          dataKey="interestRate"
          stroke="#e5ff00"
          strokeWidth={1.5}
          fill="url(#gradiant-yellow)"
          fillOpacity={1}
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
