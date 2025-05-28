"use client"

import Divider from "@/components/design_system/structure/divider"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import Title from "@/components/design_system/structure/title"

import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { useTgUsdRecordContext } from "./tg_usd_record_context"

type TgUsdLoanDetailProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default function TgUsdLoanDetail({ ...props }: TgUsdLoanDetailProps) {
  const { isWellConnected } = useWalletConnexionContext()
  const { marketDisplayData, futureMarketDisplayData } = useTgUsdRecordContext()

  if (!isWellConnected) return <></>

  return (
    <div className="rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]" {...props}>
      <Title label={"Loan details"} size={"normal"} />
      <Divider />
      <div className="flex gap-4">
        <EvolutionBox
          originalValue={marketDisplayData.collateralValue}
          label={"Collateral value"}
          newValue={futureMarketDisplayData.collateralValue}
          className="flex-1"
        />
        <EvolutionBox originalValue={marketDisplayData.debt} label={"Debt"} newValue={futureMarketDisplayData.debt} className="flex-1" logo="tgUSD" />
        <EvolutionBox originalValue={marketDisplayData.health} label={"Health"} newValue={futureMarketDisplayData.health} className="flex-1" />
        <EvolutionBox originalValue={marketDisplayData.ltv} label={"LTV"} newValue={futureMarketDisplayData.ltv} className="flex-1" />

        <EvolutionBox originalValue={"XXX"} label={"Position APR"} newValue={"YYY"} className="flex-1" />
      </div>
    </div>
  )
}
