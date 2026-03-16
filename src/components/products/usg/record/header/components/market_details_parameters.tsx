"use client"

import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { useUSGContext } from "../../../usg_context"
import { useUSGRecordContext } from "../../usg_record_context"
import { RecordPageHeader } from "@/components/design_system/structure/record_page_header"
import { getRewardTokenFromAprDetails } from "../../../list/usg_market_controller"
import { USGMarkets } from "../../../usg_repository"
import { useMemo } from "react"

type RewardsApr = Record<string, number>

export function MarketDetailsParameters() {
  const { marketAprs } = useUSGContext()

  const { marketDisplayData, marketData, computedBorrowRate } = useUSGRecordContext()

  const currentMarketApr = useMemo(() => {
    if (marketAprs && marketData) {
      const aprs = marketAprs.find((m) => m.marketAddress.toLowerCase() === marketData?.marketAddress.toLowerCase())
      const protocol = (USGMarkets.find((m) => m.marketAddress === aprs?.marketAddress)?.marketType || "Curve") as string
      const rewardToken = getRewardTokenFromAprDetails(aprs?.currentAPR as RewardsApr, protocol)

      return { aprs, protocol, rewardToken }
    }
  }, [marketAprs, marketData])

  return (
    <ReliefCard className="my-4 hidden h-24 items-center justify-evenly py-2 md:flex">
      {currentMarketApr && marketData && (
        <RecordPageHeader
          poolName={marketData?.collateralInfo?.name}
          logoKey={marketData.collateralInfo.logoKey}
          currentAPRDetails={currentMarketApr?.aprs?.currentAPR}
          projectedAPRDetails={currentMarketApr?.aprs?.projectedAPR}
          rewardToken={currentMarketApr?.rewardToken}
          maxLTV={Number(marketData?.constants?.maxLTV) / 100000}
          apr={currentMarketApr?.aprs}
          marketType={marketData?.marketType}
          indicators={[
            {
              title: "Borrow rate",
              value: <div className="flex items-center">{computedBorrowRate.current}</div>,
              subValue: (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-subtitle"> Proj:</span> {computedBorrowRate.next}
                </div>
              ),
              indicator: "Interest rate that borrowers pay on their outstanding debt.",
            },
            {
              title: "Rewards cut",
              value: marketDisplayData.rewardsCutCurrent,
              subValue: (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-subtitle"> Proj:</span> {marketDisplayData.rewardsCutNext}
                </div>
              ),
              indicator: "The percentage of collateral's rewards that are deducted.",
            },
            {
              title: "Max LTV",
              value: marketDisplayData.maxLtv,
              subValue: null,
              indicator: "Maximum Loan-to-value: represents the maximum borrowable amount compared to the collateral's value.",
            },
            {
              title: "LT",
              value: marketDisplayData.lt,
              subValue: null,
              indicator: "Liquidation-threshold: the LTV at which your position becomes eligible for liquidation.",
            },
          ]}
        />
      )}
    </ReliefCard>
  )
}
