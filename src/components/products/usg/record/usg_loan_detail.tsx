"use client"

import { useMemo } from "react"
import { useUSGRecordContext } from "./usg_record_context"
import { Title } from "@/components/design_system/structure/title"
import { Divider } from "@/components/design_system/structure/divider"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { EvolutionBox } from "@/components/design_system/structure/evolution_box"
import { formatBigIntAsNumber } from "@/lib/number_formatter"
import { getLTVColor, isVolatileCollateral } from "@/lib/risk_color"

export function USGLoanDetail() {
  const { marketDisplayData, futureMarketDisplayData, marketData, collateralInfo } = useUSGRecordContext()

  const maxLtv = useMemo(() => parseFloat(marketDisplayData.maxLtv), [marketDisplayData.maxLtv])
  const volatile = useMemo(() => isVolatileCollateral(collateralInfo?.symbol ?? ""), [collateralInfo?.symbol])

  const currentRiskColor = useMemo(() => getLTVColor(marketDisplayData.ltv, maxLtv, volatile), [marketDisplayData.ltv, maxLtv, volatile])
  const futureRiskColor = useMemo(() => getLTVColor(futureMarketDisplayData.ltv, maxLtv, volatile), [futureMarketDisplayData.ltv, maxLtv, volatile])

  return (
    <ReliefCard className="flex flex-col p-5">
      <Title label="Loan details" size="normal" />

      <Divider />

      <div className="hidden w-full flex-col gap-2 lg:flex lg:flex-row">
        <div className="flex w-full gap-2">
          <EvolutionBox
            originalValue={marketDisplayData.collateralValue}
            label={"Collateral value"}
            newValue={futureMarketDisplayData.collateralValue}
            className="flex-1"
            displayHover={!!marketData?.collateralInfos?.positionCollateralAmount && marketData?.collateralInfos?.positionCollateralAmount > 0n}
            hoverContent={
              formatBigIntAsNumber(marketData?.collateralInfos?.positionCollateralAmount || 0n, collateralInfo?.decimals, collateralInfo?.displayDecimals) +
              " " +
              marketData?.collateralInfo?.symbol
            }
          />
          <EvolutionBox originalValue={marketDisplayData.debt} label={"Debt"} newValue={futureMarketDisplayData.debt} className="flex-1" logo="USG" />
        </div>
        <div className="flex w-full flex-col gap-2 lg:flex-row">
          <EvolutionBox
            originalValue={marketDisplayData.health}
            label={"Health"}
            newValue={futureMarketDisplayData.health}
            className="flex-1"
            originalColor={currentRiskColor}
            newValueColor={futureRiskColor}
          />
          <EvolutionBox
            originalValue={marketDisplayData.ltv}
            label={"LTV"}
            newValue={futureMarketDisplayData.ltv}
            className="flex-1"
            originalColor={currentRiskColor}
            newValueColor={futureRiskColor}
          />
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
          <EvolutionBox
            originalValue={marketDisplayData.health}
            label={"Health"}
            newValue={futureMarketDisplayData.health}
            className="flex-1"
            originalColor={currentRiskColor}
            newValueColor={futureRiskColor}
          />
        </div>
        <div className="flex w-full flex-col gap-2 lg:flex-row">
          <EvolutionBox originalValue={marketDisplayData.debt} label={"Debt"} newValue={futureMarketDisplayData.debt} className="flex-1" logo="USG" />
          <EvolutionBox
            originalValue={marketDisplayData.ltv}
            label={"LTV"}
            newValue={futureMarketDisplayData.ltv}
            className="flex-1"
            originalColor={currentRiskColor}
            newValueColor={futureRiskColor}
          />
        </div>
      </div>
    </ReliefCard>
  )
}
