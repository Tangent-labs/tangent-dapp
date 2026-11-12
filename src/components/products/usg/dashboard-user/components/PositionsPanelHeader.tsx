"use client"

import { Title } from "@/components/design_system/structure/title"
import { Button } from "@/components/design_system/inputs/button"
import IndicatorV2 from "@/components/design_system/structure/indicators_v2"

type PositionsPanelHeaderProps = {
  title: string
  // Small cards displayed on the right (Deposited, Claimable Rewards...)
  indicators: { title: string; value: string }[]
  claim?: { onClick: () => void; isActive: boolean }
}

// Title, totals and claim button shared by all the position tables
export const PositionsPanelHeader = ({ title, indicators, claim }: PositionsPanelHeaderProps) => (
  <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <Title label={title} size="normal" />

    <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row md:items-end">
      <div className="flex w-full gap-2.5 md:w-auto">
        {indicators.map((indicator) => (
          <IndicatorV2 key={indicator.title} indicators={[indicator]} className="min-h-[60px] md:w-[217px]" />
        ))}
      </div>

      {claim && (
        <div className="w-full md:w-[133px]">
          <Button onClick={claim.onClick} state={claim.isActive ? "active" : "inactive"}>
            Claim rewards
          </Button>
        </div>
      )}
    </div>
  </div>
)
