"use client"

import { formatDisplayValue } from "@/lib/number_formatter"
import { useUSGRecordContext } from "./tg_usd_record_context"
import Title from "@/components/design_system/structure/title"
import Divider from "@/components/design_system/structure/divider"
import EvolutionBox from "@/components/design_system/structure/evolution_box"

export default function USGLoanDetail() {
  const { marketDisplayData, futureMarketDisplayData, liquidationPrice } = useUSGRecordContext()

  return (
    <div className="mb-2 flex flex-col rounded-[10px] bg-overlay-panel px-3 py-2 backdrop-blur-[60px]">
      <div className="flex w-full items-center justify-between">
        <Title label={"Loan details"} size={"normal"} />

        {!!liquidationPrice && <div className="font-gilroy text-tonic"> Liquidation Price : ${formatDisplayValue((liquidationPrice * 100).toFixed(3))} </div>}
      </div>
      <Divider />
      <div className="flex flex-wrap gap-2">
        <EvolutionBox
          originalValue={marketDisplayData.collateralValue}
          label={"Collateral value"}
          newValue={futureMarketDisplayData.collateralValue}
          className="flex-1"
        />
        <EvolutionBox originalValue={marketDisplayData.debt} label={"Debt"} newValue={futureMarketDisplayData.debt} className="flex-1" logo="USG" />
        <EvolutionBox originalValue={marketDisplayData.health} label={"Health"} newValue={futureMarketDisplayData.health} className="flex-1" />
        <EvolutionBox originalValue={marketDisplayData.ltv} label={"LTV"} newValue={futureMarketDisplayData.ltv} className="flex-1" />
      </div>
    </div>
  )
}
