"use client"

import { useUSGContext } from "../../../usg_context"
import { useUSGRecordContext } from "../../usg_record_context"
import RecordPageHeader from "@/components/design_system/structure/record_page_header"

export default function MarketDetailsParameters() {
  const { marketAprs } = useUSGContext()

  const { marketDisplayData, marketData, computedBorrowRate } = useUSGRecordContext()

  const currentMarketApr = marketAprs.find((m) => m.marketAddress.toLowerCase() === marketData?.marketAddress.toLowerCase())

  return (
    <div className="mt-4 hidden h-24 items-center justify-evenly rounded-[10px] bg-overlay-panel py-2 backdrop-blur-[60px] md:flex">
      <RecordPageHeader
        apr={currentMarketApr!}
        indicators={[
          {
            title: "Borrow rate",
            value: (
              <div className="flex items-center gap-2">
                <span>{computedBorrowRate.current}</span>
              </div>
            ),
            subValue: (
              <div className="flex items-center gap-2">
                <span className="text-sm text-subtitle"> Proj:</span> <span> {computedBorrowRate.next} </span>
              </div>
            ),
            indicator: "Interest rate that borrowers pay on their outstanding debt.",
          },
          {
            title: "Rewards cut",
            value: marketDisplayData.rewardsCutCurrent,
            subValue: marketDisplayData.rewardsCutNext,
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
  )
}
