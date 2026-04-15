"use client"

import { formatUnits } from "viem"
import { useMemo, useState } from "react"
import { PositionAPR } from "./position_apr"
import { USGStakingInfo } from "../../usg_type"
import { formatNumber } from "@/lib/number_formatter"
import { ForecastGraph } from "./usg_staking_forecast"
import { SlidingTabs } from "../../airdrop/tasks/components/SlidingTabs"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { EvolutionBox } from "@/components/design_system/structure/evolution_box"

interface PositionPerformancePanelProps {
  sUSGCurrentAPY: number
  USGsUSGMetrics: USGStakingInfo
  currentFeature: "stake" | "unstake"
  weiValue: bigint
  computeProjectedValue: number
  sUSGSelectedTab: string
  apyHistory: Array<{ date: number; uv: number }>
  fetchsUSGHistoryAPY: (range: string) => Promise<void>
  computeProjection: (balance: bigint, timeFrame: number, apr: number, currentFeature: "stake" | "unstake", amount?: bigint) => string
}

const PROJECTED_EARNINGS = "Projected earnings"
const POSITION_APR = "Position APR"

export function PositionPerformancePanel({
  USGsUSGMetrics,
  currentFeature,
  weiValue,
  computeProjectedValue,
  sUSGCurrentAPY,
  sUSGSelectedTab,
  apyHistory,
  computeProjection,
  fetchsUSGHistoryAPY,
}: PositionPerformancePanelProps) {
  const [selectedFeature, setSelectedFeature] = useState<string>(PROJECTED_EARNINGS)

  const sUSGBalance = useMemo(() => {
    return Number(formatUnits(USGsUSGMetrics?.sUSGBalance ?? 0n, 18))
  }, [USGsUSGMetrics?.USGBalance])

  const addLiq = useMemo(() => {
    return weiValue ? Number(formatUnits(weiValue, 18)) : 0
  }, [weiValue])

  return (
    <div className="hidden h-full w-full flex-col items-stretch justify-stretch lg:flex lg:w-7/12 xl:w-2/3">
      <div className="w-full">
        <SlidingTabs labels={["Projected earnings", "Position APR"]} value={selectedFeature} onSwitchTab={(e: string) => setSelectedFeature(e)} />
      </div>

      <ReliefCard className="mt-[20px] flex w-full flex-col items-center justify-between gap-2 p-5 sm:flex-row">
        <EvolutionBox
          className="w-full"
          originalValue={formatNumber(sUSGBalance, 0)}
          label="sUSG balance"
          newValue={formatNumber(computeProjectedValue >= 0 ? computeProjectedValue : 0, 0)}
          logo="sUSG"
        />

        <EvolutionBox
          className="w-full"
          originalValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1 / 12, sUSGCurrentAPY, currentFeature)}
          label="30 days projection"
          newValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1 / 12, sUSGCurrentAPY, currentFeature, weiValue)}
          logo="USG"
        />

        <EvolutionBox
          className="w-full"
          originalValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1, sUSGCurrentAPY, currentFeature)}
          label="1 year projection"
          newValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1, sUSGCurrentAPY, currentFeature, weiValue)}
          logo="USG"
        />
      </ReliefCard>

      <ReliefCard className="mt-5 flex w-full flex-col p-[20px]">
        {selectedFeature === PROJECTED_EARNINGS && (
          <ForecastGraph currentFeature={currentFeature} currentInvestment={sUSGBalance} apr={sUSGCurrentAPY} newLiquidity={addLiq} />
        )}

        {selectedFeature === POSITION_APR && (
          <PositionAPR apyHistory={apyHistory} fetchsUSGHistoryAPY={fetchsUSGHistoryAPY} sUSGSelectedTab={sUSGSelectedTab} apr={sUSGCurrentAPY} />
        )}
      </ReliefCard>
    </div>
  )
}
