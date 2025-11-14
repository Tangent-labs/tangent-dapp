"use client"

import { formatUnits } from "viem"
import { useMemo, useState } from "react"
import { USGStakingInfo } from "../../tg_usd_type"
import { formatNumber } from "@/lib/number_formatter"
import { ForecastGraph } from "../tg_usd_staking_forecast"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { SlidingTabs } from "../../airdrop/tasks/components/SlidingTabs"
import { ValueType } from "recharts/types/component/DefaultTooltipContent"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import Divider from "@/components/design_system/structure/divider"

interface PerformanceHistoryPanelProps {
  sUSGCurrentAPY: number
  USGsUSGMetrics: USGStakingInfo
  currentFeature: "stake" | "unstake" | string
  weiValue: bigint
  computeProjectedValue: number
  sUSGSelectedTab: string
  apyHistory: Array<{ date: number; uv: number }>
  fetchsUSGHistoryAPY: (s: string) => Promise<void>
  computeProjection: (stakeInfo: USGStakingInfo, timeFrame: number, apr: number, addedLiquidity?: bigint) => string
}

const CustomTooltip = (props: {
  active?: boolean | undefined
  payload?: Array<{ dataKey?: string | number | undefined; value?: ValueType | undefined }> | undefined
  label?: number
}) => {
  const date = new Date(props?.label as number)

  const value = Number(props?.payload ? props?.payload[0]?.value : 0)

  return (
    <div className="pointer-events-none rounded-xl bg-[#070707] px-3 py-2 text-[10px]">
      <div className="flex gap-1">
        <div className="text-subtitle">Date : </div>
        <div className="font-semibold text-white">{date.toDateString()}</div>
      </div>
      <div className="flex gap-1">
        <div className="text-subtitle">APY :</div>
        <div className="font-semibold text-white"> {value}</div>
      </div>
    </div>
  )
}

const formatYAxis = (tick: number) => `${tick} %`

const formatXAxis = (tick: string) => {
  const date = new Date(tick)
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`
}

export default function PerformanceHistoryPanel({
  USGsUSGMetrics,
  currentFeature,
  weiValue,
  computeProjectedValue,
  sUSGCurrentAPY,
  sUSGSelectedTab,
  apyHistory,
  computeProjection,
  fetchsUSGHistoryAPY,
}: PerformanceHistoryPanelProps) {
  const [selectedFeature, setSelectedFeature] = useState<string>("Projected earnings")

  const sUSGBalance = useMemo(() => {
    return Number(formatUnits(USGsUSGMetrics?.sUSGBalance ?? 0n, 18))
  }, [USGsUSGMetrics?.USGBalance])

  const addLiq = useMemo(() => {
    return currentFeature === "stake" ? (weiValue ? Number(formatUnits(weiValue, 18)) : 0) : 0
  }, [weiValue])

  return (
    <div className="flex w-full flex-col rounded-[10px] bg-overlay-panel px-4 py-2 backdrop-blur-[60px] lg:w-7/12">
      <div className="w-full">
        <SlidingTabs labels={["Projected earnings", "Position APR"]} value={selectedFeature} onSwitchTab={(e: string) => setSelectedFeature(e)} />
      </div>

      <div className="mt-4 w-full">
        {selectedFeature === "Projected earnings" && (
          <>
            <ForecastGraph initialInvestment={sUSGBalance} apr={sUSGCurrentAPY} additionalLiquidity={addLiq} />

            <Divider className="h-0.5 w-full bg-white/10" />

            {!!sUSGCurrentAPY && sUSGCurrentAPY > 0 && (
              <div className="mt-3 flex w-full flex-col items-end justify-between gap-2 self-end sm:flex-row">
                <EvolutionBox
                  className="w-full"
                  originalValue={formatNumber(sUSGBalance, 0)}
                  label="sUSG balance"
                  newValue={formatNumber(computeProjectedValue, 0)}
                />

                <EvolutionBox
                  className="w-full"
                  originalValue={computeProjection(USGsUSGMetrics!, 1 / 12, sUSGCurrentAPY)}
                  label="30 days projection"
                  newValue={computeProjection(USGsUSGMetrics!, 1 / 12, sUSGCurrentAPY, weiValue)}
                />

                <EvolutionBox
                  className="w-full"
                  originalValue={computeProjection(USGsUSGMetrics!, 1, sUSGCurrentAPY)}
                  label="1 year projection"
                  newValue={computeProjection(USGsUSGMetrics!, 1, sUSGCurrentAPY, weiValue)}
                />
              </div>
            )}
          </>
        )}

        {selectedFeature === "Position APR" && (
          <>
            <div className="mb-2 flex w-full items-center justify-end">
              <div className="mt-1 flex gap-2">
                <ButtonTab onClick={() => fetchsUSGHistoryAPY("1w")} label={"1w"} active={sUSGSelectedTab === "1w"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchsUSGHistoryAPY("1m")} label={"1m"} active={sUSGSelectedTab === "1m"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchsUSGHistoryAPY("1y")} label={"1y"} active={sUSGSelectedTab === "1y"} className="rounded-full !py-1" />
              </div>
            </div>

            <div className="mb-8 flex h-48 min-h-48 w-full items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  width={500}
                  height={400}
                  data={apyHistory}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <defs>
                    <linearGradient id="gradientFill1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0075FF" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#0075FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickFormatter={formatXAxis} scale="point" padding={{ left: 10, right: 10 }} />
                  <YAxis tickFormatter={formatYAxis} />
                  <Area type="monotone" dataKey="uv" stroke="#00C2FF" fill="url(#gradientFill1)" />

                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 2 }}
                    allowEscapeViewBox={{ x: false, y: false }}
                    content={<CustomTooltip />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
