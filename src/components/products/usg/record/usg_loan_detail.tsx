"use client"

import { useUSGRecordContext } from "./usg_record_context"
import Title from "@/components/design_system/structure/title"
import Divider from "@/components/design_system/structure/divider"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

export default function USGLoanDetail() {
  const { marketDisplayData, futureMarketDisplayData } = useUSGRecordContext()

  return (
    <ReliefCard className="flex flex-col rounded-[10px] bg-overlay-panel px-3 py-2 backdrop-blur-[60px]">
      <div className="flex w-full items-center justify-between">
        <Title label={"Loan details"} size={"normal"} />
      </div>
      <Divider />

      <div className="hidden w-full flex-col gap-2 lg:flex lg:flex-row">
        <div className="flex w-full gap-2">
          <EvolutionBox
            originalValue={marketDisplayData.collateralValue}
            label={"Collateral value"}
            newValue={futureMarketDisplayData.collateralValue}
            className="flex-1"
          />
          <EvolutionBox originalValue={marketDisplayData.debt} label={"Debt"} newValue={futureMarketDisplayData.debt} className="flex-1" logo="USG" />
        </div>
        <div className="flex w-full flex-col gap-2 lg:flex-row">
          <EvolutionBox originalValue={marketDisplayData.health} label={"Health"} newValue={futureMarketDisplayData.health} className="flex-1" />
          <EvolutionBox originalValue={marketDisplayData.ltv} label={"LTV"} newValue={futureMarketDisplayData.ltv} className="flex-1" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 lg:hidden">
        <div className="flex w-full gap-2">
          <EvolutionBox
            originalValue={marketDisplayData.collateralValue}
            label={"Collateral value"}
            newValue={futureMarketDisplayData.collateralValue}
            className="flex-1"
          />
          <EvolutionBox originalValue={marketDisplayData.health} label={"Health"} newValue={futureMarketDisplayData.health} className="flex-1" />
        </div>
        <div className="flex w-full flex-col gap-2 lg:flex-row">
          <EvolutionBox originalValue={marketDisplayData.debt} label={"Debt"} newValue={futureMarketDisplayData.debt} className="flex-1" logo="USG" />
          <EvolutionBox originalValue={marketDisplayData.ltv} label={"LTV"} newValue={futureMarketDisplayData.ltv} className="flex-1" />
        </div>
      </div>
    </ReliefCard>
  )
}
