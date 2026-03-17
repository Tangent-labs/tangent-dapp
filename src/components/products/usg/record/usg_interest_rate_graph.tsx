"use client"

import { useEffect, useState } from "react"
import { formatUnits, parseUnits } from "viem"
import { computeIR } from "./usg_record_controller"
import { useUSGRecordContext } from "./usg_record_context"
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Legend, Area, Tooltip } from "recharts"

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
    const endPrice = 0.985
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
    <div className="flex h-[300px] w-full border-0 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: -20,
            left: -20,
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
            label={{ value: "Token Price ($)", position: "bottom", offset: 10 }}
            className="text-sm"
            axisLine={{ stroke: "#454545" }}
            tickLine={false}
            tickFormatter={(value) => value.toFixed(3)}
            ticks={[1.0, 0.995, 0.99, 0.985]}
            domain={[1.0, 0.985]}
          />

          <YAxis
            yAxisId="left"
            dataKey="rewardsCut"
            label={{ value: "Rewards cut (%)", angle: -90, position: "insideLeft", offset: 10 }}
            className="text-xs"
            tick={{ fill: "#0075FF" }}
            axisLine={{ stroke: "#454545" }}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />

          <YAxis
            yAxisId="right"
            dataKey="interestRate"
            orientation="right"
            label={{ value: "Interest rate (%)", angle: 90, position: "insideRight", offset: 10 }}
            className="text-xs"
            tick={{ fill: "#e5ff00" }}
            axisLine={{ stroke: "#454545" }}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 160]}
          />

          <CartesianGrid horizontal={true} vertical={false} stroke="#454545" strokeOpacity={0.3} />

          <Legend verticalAlign="top" height={36} formatter={(value) => (value === "rewardsCut" ? "Rewards cut 90%" : "Interest rate 10%")} />

          <Tooltip
            contentStyle={{ backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name === "rewardsCut" ? "Rewards Cut" : "Interest Rate"]}
            labelFormatter={(label: number) => `Price: $${label.toFixed(3)}`}
          />

          <Area yAxisId="left" type="stepAfter" dataKey="rewardsCut" stroke="#0075FF" strokeWidth={2} fill="url(#gradiant-blue)" fillOpacity={1} />

          <Area
            yAxisId="right"
            type="monotone"
            dataKey="interestRate"
            stroke="#e5ff00"
            strokeWidth={2}
            fill="url(#gradiant-yellow)"
            fillOpacity={1}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
