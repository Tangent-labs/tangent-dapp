"use client"

import { formatUnits } from "viem"
import { useMemo, useState } from "react"
import { formatNumber } from "@/lib/number_formatter"
import { computeProjection } from "../stake_tan_controller"
import { PositionAPR } from "../../../usg/stake/components/position_apr"
import { ForecastGraph } from "../../../usg/stake/components/usg_staking_forecast"
import { SlidingTabs } from "../../../usg/airdrop/tasks/components/SlidingTabs"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { EvolutionBox } from "@/components/design_system/structure/evolution_box"

interface TanPositionPerformancePanelProps {
  sTanCurrentAPY: number
  sTanBalance: bigint
  currentFeature: "stake" | "unstake"
  weiValue: bigint
  computeProjectedValue: number
  sTanSelectedTab: string
  apyHistory: Array<{ date: number; uv: number }>
  fetchsTanHistoryAPY: (range: string) => Promise<void>
}

const PROJECTED_EARNINGS = "Projected earnings"
const APY_HISTORY = "APY history"

export function TanPositionPerformancePanel({
  sTanBalance,
  currentFeature,
  weiValue,
  computeProjectedValue,
  sTanCurrentAPY,
  sTanSelectedTab,
  apyHistory,
  fetchsTanHistoryAPY,
}: TanPositionPerformancePanelProps) {
  const [selectedFeature, setSelectedFeature] = useState<string>(APY_HISTORY)

  const balance = useMemo(() => Number(formatUnits(sTanBalance ?? 0n, 18)), [sTanBalance])

  const addLiq = useMemo(() => (weiValue ? Number(formatUnits(weiValue, 18)) : 0), [weiValue])

  return (
    <div className="hidden h-full w-full flex-col items-stretch justify-stretch lg:flex lg:w-7/12 xl:w-2/3">
      <div className="w-full">
        <SlidingTabs labels={[PROJECTED_EARNINGS, APY_HISTORY]} value={selectedFeature} onSwitchTab={(e: string) => setSelectedFeature(e)} />
      </div>

      <ReliefCard className="mt-[20px] flex w-full flex-col items-center justify-between gap-2 p-5 sm:flex-row">
        <EvolutionBox
          className="w-full"
          originalValue={formatNumber(balance, 0)}
          label="sTAN balance"
          newValue={formatNumber(computeProjectedValue >= 0 ? computeProjectedValue : 0, 0)}
          logo="sTAN"
        />

        <EvolutionBox
          className="w-full"
          originalValue={computeProjection(sTanBalance, 1 / 12, sTanCurrentAPY, currentFeature)}
          label="30 days projection"
          newValue={computeProjection(sTanBalance, 1 / 12, sTanCurrentAPY, currentFeature, weiValue)}
          logo="TAN"
        />

        <EvolutionBox
          className="w-full"
          originalValue={computeProjection(sTanBalance, 1, sTanCurrentAPY, currentFeature)}
          label="1 year projection"
          newValue={computeProjection(sTanBalance, 1, sTanCurrentAPY, currentFeature, weiValue)}
          logo="TAN"
        />
      </ReliefCard>

      <ReliefCard className="mt-5 flex w-full flex-col overflow-visible p-5">
        {selectedFeature === PROJECTED_EARNINGS && (
          <ForecastGraph currentFeature={currentFeature} currentInvestment={balance} apy={sTanCurrentAPY} newLiquidity={addLiq} />
        )}

        {selectedFeature === APY_HISTORY && (
          <PositionAPR apyHistory={apyHistory} token="sTAN" fetchsUSGHistoryAPY={fetchsTanHistoryAPY} sUSGSelectedTab={sTanSelectedTab} apy={sTanCurrentAPY} />
        )}
      </ReliefCard>
    </div>
  )
}
