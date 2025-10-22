"use client"

import Divider from "@/components/design_system/structure/divider"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import Title from "@/components/design_system/structure/title"

import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { useUSGRecordContext } from "./tg_usd_record_context"

export default function USGLoanDetail() {
  const { isWellConnected } = useWalletConnexionContext()
  const { marketDisplayData, futureMarketDisplayData } = useUSGRecordContext()

  if (!isWellConnected) return <></>

  return (
    <div className="flex flex-col rounded-[10px] bg-overlay-panel px-3 py-2 backdrop-blur-[60px]">
      <Title label={"Loan details"} size={"normal"} />
      <Divider />
      <div className="flex flex-wrap gap-2 lg:gap-6">
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
