"use client"

import { useEffect, useState } from "react"
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Legend, Area, Tooltip } from "recharts"
import { useTgUsdRecordContext } from "./tg_usd_record_context"
import { formatUnits, parseEther, parseUnits } from "viem"

export default function InterestRateGraph() {
  const { marketData } = useTgUsdRecordContext()

  interface IrParams {
    a1: number
    a2: number
    isHEC: boolean
    k: number
    pInf: number
    pMax: number
    pMin: number
    rMax: number
    rMin: number
  }

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

  const computeIR = (tgUSDPrice: bigint, irParams: IrParams) => {
    const tgUSDPriceNumber = Number(formatUnits(tgUSDPrice, 18))
    const normalizedPMin = Number(formatUnits(BigInt(irParams.pMin), 6))
    const normalizedPMax = Number(formatUnits(BigInt(irParams.pMax), 6))

    if (tgUSDPriceNumber <= normalizedPMin) {
      const ir = Number(formatUnits(BigInt(irParams.rMax), 5))
      const adjustedIR = Math.exp(ir) - 1
      return parseEther(adjustedIR.toFixed(18))
    }
    if (tgUSDPriceNumber >= normalizedPMax) {
      if (irParams.isHEC) {
        const ir = 0
        const adjustedIR = Math.exp(ir) - 1
        return parseEther(adjustedIR.toFixed(18))
      }
      const ir = Number(formatUnits(BigInt(irParams.rMin), 5))
      const adjustedIR = Math.exp(ir) - 1
      return parseEther(adjustedIR.toFixed(18))
    }
    const priceDelta = tgUSDPriceNumber - Number(formatUnits(BigInt(irParams.pInf), 6))

    const sigmaX = Number(irParams.k) * priceDelta

    const exp = Math.exp(-sigmaX)

    const sigma = 1 / (1 + exp)

    const alpha1 = Number(irParams.a1) / 1_000
    const alpha = alpha1 + (Number(irParams.a2) / 1_000 - alpha1) * sigma

    const quotient = (normalizedPMax - tgUSDPriceNumber) / (normalizedPMax - normalizedPMin)

    const priceRatio = quotient ** alpha

    const irIncrement = Number(formatUnits(BigInt(irParams.rMax) - BigInt(irParams.rMin), 5)) * priceRatio

    const ir = Number(formatUnits(BigInt(irParams.rMin), 5)) + irIncrement

    const adjustedIR = Math.exp(ir) - 1

    return parseEther(adjustedIR.toFixed(18))
  }

  const computeRewardsCut = (tgUSDPrice: bigint, rcParams: RCParams) => {
    const stepAmount = rcParams.stepAmount
    const startCutPrice = rcParams.startCutPrice * BigInt(10 ** 12)
    const endCutPrice = rcParams.endCutPrice * BigInt(10 ** 12)
    const tgUSDPriceScaled = tgUSDPrice as bigint

    if (stepAmount === 1) {
      return rcParams.startCutPercentage
    } else if (stepAmount === 2) {
      if (tgUSDPriceScaled >= startCutPrice) {
        return rcParams.startCutPercentage
      } else {
        return rcParams.endCutPercentage
      }
    } else {
      if (tgUSDPriceScaled >= startCutPrice) {
        return rcParams.startCutPercentage
      }
      if (tgUSDPriceScaled <= endCutPrice) {
        return rcParams.endCutPercentage
      }

      // Compute the actual step regarding the current price of USG
      const actualStep = BigInt(1) + (BigInt(stepAmount - 2) * (startCutPrice - tgUSDPriceScaled)) / (startCutPrice - endCutPrice)

      // Compute the percentage amount increased by one step

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
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 30,
            right: 30,
            left: 10,
            bottom: 20,
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
            domain={[1.0, 0.98]}
          />

          <YAxis
            yAxisId="left"
            dataKey="rewardsCut"
            label={{ value: "Rewards cut (%)", angle: -90, position: "insideLeft", offset: 10 }}
            className="text-sm"
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
            className="text-sm"
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
