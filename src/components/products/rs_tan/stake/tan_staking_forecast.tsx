"use client"

import ButtonTab from "@/components/design_system/inputs/button_tab"
import Panel from "@/components/design_system/structure/panel"
import TokenImage from "@/components/design_system/structure/token_image"
import React, { useMemo, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"

const calculateYAxis = (minValue: number, maxValue: number) => {
  const range = maxValue - minValue

  const stepSizes = [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 25000, 40000, 50000, 75000, 100000]
  const stepSize = stepSizes.find((step) => range / step < 6) || stepSizes[stepSizes.length - 1]

  const min = Math.floor(minValue / stepSize) * stepSize
  const max = Math.ceil(maxValue / stepSize) * stepSize

  return {
    min,
    max,
    stepSize,
  }
}

interface ForecastGraphProps {
  initialInvestment: number
  apr: number
  additionalLiquidity: number
}

export const ForecastGraph = ({ initialInvestment, apr, additionalLiquidity }: ForecastGraphProps) => {
  const timeFilters = {
    week: 1 / 52,
    month: 1 / 12,
    year: 1,
    twoYears: 2,
  }

  const [filter, setFilter] = useState<number>(timeFilters.year)

  const forecastData = useMemo(() => {
    const n = 26

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const data = []
    const totalPeriods = Math.ceil(filter * n)

    for (let i = 0; i <= totalPeriods; i++) {
      const timeInYears = i / n
      const baseAmount = initialInvestment * Math.pow(1 + apr / 100 / n, n * timeInYears)
      const amountWithLiquidity = (initialInvestment + additionalLiquidity) * Math.pow(1 + apr / 100 / n, n * timeInYears)

      const monthIndex = Math.floor((i / n) * 12) % 12
      const monthName = months[monthIndex].substring(0, 3)

      data.push({
        time: monthName,
        baseAmount: baseAmount.toFixed(2),
        amountWithLiquidity: amountWithLiquidity.toFixed(2),
      })
    }

    return data
  }, [filter, initialInvestment, apr, additionalLiquidity])

  const allData = useMemo(() => {
    return [...forecastData.map((d) => parseFloat(d.baseAmount)), ...forecastData.map((d) => parseFloat(d.amountWithLiquidity))]
  }, [forecastData])

  const minAmount = Math.min(...allData)
  const maxAmount = Math.max(...allData)

  const yAxisSettings = calculateYAxis(minAmount, maxAmount)

  return (
    <>
      <div className="flex h-8 w-full items-center justify-between">
        <div className="flex items-center justify-start gap-2">
          <div className="flex w-fit items-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-2 backdrop-blur-[60px]">
            <TokenImage token="sgUSD" size={16} />
            <span className="text-sm font-semibold leading-3">
              <span>sgUSD</span>
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg bg-button-active px-4 py-1">
            <span className="text-lg font-semibold">{apr}%</span>
          </div>
        </div>

        <div className="flex items-end justify-end gap-2">
          <ButtonTab
            onClick={() => setFilter(timeFilters.week)}
            label={"1w"}
            active={false}
            className={`cursor-pointer rounded-xl border border-white/30 px-4 py-1 text-xs ${filter === timeFilters.week ? "bg-white text-black" : ""}`}
          />
          <ButtonTab
            onClick={() => setFilter(timeFilters.month)}
            label={"1m"}
            active={false}
            className={`cursor-pointer rounded-xl border border-white/30 px-4 py-1 text-xs ${filter === timeFilters.month ? "bg-white text-black" : ""}`}
          />
          <ButtonTab
            onClick={() => setFilter(timeFilters.year)}
            label={"1y"}
            active={false}
            className={`cursor-pointer rounded-xl border border-white/30 px-4 py-1 text-xs ${filter === timeFilters.year ? "bg-white text-black" : ""}`}
          />
          <ButtonTab
            onClick={() => setFilter(timeFilters.twoYears)}
            label={"2y"}
            active={false}
            className={`cursor-pointer rounded-xl border border-white/30 px-4 py-1 text-xs ${filter === timeFilters.twoYears ? "bg-white text-black" : ""}`}
          />
        </div>
      </div>

      <Panel className="mt-3 flex h-full w-full items-center justify-center !pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid horizontal={true} vertical={false} />
            <XAxis dataKey="time" tickFormatter={(value) => value} interval={Math.max(1, Math.floor(forecastData.length / 12)) - 1} />

            <YAxis
              orientation="right"
              tickFormatter={(value) => `$${value}`}
              domain={[yAxisSettings.min, yAxisSettings.max]}
              ticks={Array.from(
                { length: (yAxisSettings.max - yAxisSettings.min) / yAxisSettings.stepSize + 1 },
                (_, i) => yAxisSettings.min + i * yAxisSettings.stepSize
              )}
            />

            <Legend />
            <Line strokeWidth={"2px"} type="monotone" dataKey="baseAmount" stroke="#FFFFFF" name="Base Investment (USD)" dot={false} />
            <Line
              strokeWidth={"2px"}
              type="monotone"
              dataKey="amountWithLiquidity"
              stroke="url(#gradientColor)"
              name="Investment + Additional Liquidity (USD)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <svg width="0" height="0">
          <defs>
            <linearGradient id="gradientColor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBF911" />
              <stop offset="100%" stopColor="#99FF00" />
            </linearGradient>
          </defs>
        </svg>
      </Panel>
    </>
  )
}
