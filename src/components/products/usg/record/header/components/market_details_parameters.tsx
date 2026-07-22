"use client"

import { useMemo } from "react"
import { USGMarkets } from "../../../usg_repository"
import { useUSGContext } from "../../../usg_context"
import { useUSGRecordContext } from "../../usg_record_context"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { getRewardTokenFromAprDetails } from "../../../list/usg_market_controller"
import { RecordPageHeader } from "@/components/design_system/structure/record_page_header"

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
    <ReliefCard className="my-2 md:my-5 md:h-[110px]">
      {currentMarketApr && marketData && (
        <div className="hidden items-center justify-evenly py-5 md:flex">
          <RecordPageHeader
            poolName={marketData?.collateralInfo?.name}
            logoKey={marketData.collateralInfo.logoKey}
            currentAPRDetails={currentMarketApr?.aprs?.currentAPR}
            projectedAPRDetails={currentMarketApr?.aprs?.projectedAPR}
            rewardToken={currentMarketApr?.rewardToken}
            maxLTV={Number(marketData?.constants?.maxLTV) / 100000}
            currentBorrowRate={marketDisplayData.borrowRateCurrent}
            projectedBorrowRate={marketDisplayData.borrowRateNext}
            apr={currentMarketApr?.aprs}
            marketType={marketData?.marketType}
            indicators={[
              {
                title: "Borrow rate",
                value: computedBorrowRate.current,
                subValue: <div className="flex items-center gap-1 text-xs text-subtitle">Proj: {computedBorrowRate.next}</div>,
                indicator: "Interest rate that borrowers pay on their outstanding debt.",
              },
              {
                title: "Rewards cut",
                value: marketDisplayData.rewardsCutCurrent,
                subValue: <div className="flex items-center gap-1 text-xs text-subtitle">Proj: {marketDisplayData.rewardsCutNext}</div>,
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
        </div>
      )}
    </ReliefCard>
  )
}
