"use client"

import Divider from "@/components/design_system/structure/divider"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import Panel from "@/components/design_system/structure/panel"
import Title from "@/components/design_system/structure/title"
import React from "react"

type TgUsdLoanDetailProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default function TgUsdLoanDetail({ ...props }: TgUsdLoanDetailProps) {
  return (
    <Panel {...props}>
      <Title label={"Loan details"} size={"normal"} />
      <Divider />
      <div className="flex gap-4">
        <EvolutionBox originalValue={"$1,000"} label={"Collateral value"} newValue={""} className="flex-1" />
        <EvolutionBox originalValue={"$1,000"} label={"Debt"} newValue={"$400"} className="flex-1" />
        <EvolutionBox originalValue={"1.5"} label={"Health"} newValue={"1.6"} className="flex-1" />
        <EvolutionBox originalValue={"$2.000"} label={"LTV"} newValue={"$4.000"} className="flex-1" />
        <EvolutionBox originalValue={"$2.000"} label={"Max borrowable"} newValue={"$4.000"} className="flex-1" />
        <EvolutionBox originalValue={"$2.000"} label={"Max withdrawable"} newValue={"$4.000"} className="flex-1" />
      </div>
    </Panel>
  )
}
