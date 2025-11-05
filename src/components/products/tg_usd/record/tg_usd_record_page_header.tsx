"use client"

import { useRouter } from "next/navigation"
import { useUSGRecordContext } from "./tg_usd_record_context"
import BorderPanel from "@/components/design_system/structure/border_panel"
import IndicatorV2 from "@/components/design_system/structure/indicators_v2"
import RecordPageHeader from "@/components/design_system/structure/record_page_header"
import { useUSGContext } from "../tg_usd_context"
import { CollateralCard } from "./collateral_selection"

export default function USGRecordPageHeader() {
  const { marketAprs } = useUSGContext()

  const { collateralInfo, marketDisplayData, marketData } = useUSGRecordContext()

  const router = useRouter()

  const currentMarketApr = marketAprs.find((m) => m.marketAddress.toLowerCase() === marketData?.marketAddress.toLowerCase())

  return (
    <>
      <div className="flex flex-col justify-between xl:flex-row">
        <CollateralCard collateralInfo={collateralInfo} marketData={marketData}></CollateralCard>

        <div className="mt-4 flex items-end gap-1 md:gap-4 xl:mt-0">
          <IndicatorV2 indicators={[{ title: "TVL", value: marketDisplayData.tvlDollar }]} />
          <IndicatorV2 indicators={[{ title: "Borrowed", value: marketDisplayData.borrowed }]} />
          <IndicatorV2 indicators={[{ title: "Cap", value: marketDisplayData.cap }]} />

          <BorderPanel
            onClick={() => router.push("/")}
            className="hidden h-10 cursor-pointer items-center rounded-[10px] bg-overlay-panel px-9 text-xs font-semibold backdrop-blur-[60px] transition-colors duration-200 ease-in-out hover:bg-white/10 xl:flex"
          >
            Back
          </BorderPanel>
        </div>

        <div className="mt-4 flex items-end gap-1 md:hidden xl:mt-0">
          <IndicatorV2 indicators={[{ title: "APR", value: "12%" }]} />
          <IndicatorV2 indicators={[{ title: "Borrow rate", value: marketDisplayData.borrowRateCurrent }]} />
          <IndicatorV2 indicators={[{ title: "LTV", value: marketDisplayData.maxLtv }]} />
        </div>
      </div>

      <RecordPageHeader
        apr={currentMarketApr!}
        indicators={[
          {
            title: "Borrow rate",
            value: <div className="flex items-center">{((Math.exp(marketDisplayData.borrowRateCurrent) - 1) * 100).toFixed(2)}%</div>,
            subValue: (
              <div className="flex items-center gap-1 text-xs text-subtitle">
                Proj: <span>{((Math.exp(marketDisplayData.borrowRateNext) - 1) * 100).toFixed(2)} %</span>
              </div>
            ),
            indicator: "Interest rate that borrowers pay on their outstanding debt",
          },
          {
            title: "Rewards cut",
            value: marketDisplayData.rewardsCutCurrent,
            subValue: (
              <div className="flex items-center gap-1 text-xs text-subtitle">
                Proj: <span>{marketDisplayData.rewardsCutNext} </span>
              </div>
            ),
            indicator: "Rewards deduction. The percentage of collateral's rewards that are deducted.",
          },
          {
            title: "LTV",
            value: marketDisplayData.maxLtv,
            subValue: null,
            indicator: "Maximum Loan-to-value: represents the maximum borrowable amount compared to the collateral's value.",
          },
          {
            title: "LT",
            value: marketDisplayData.lt,
            subValue: null,
            indicator: "Liquidation-threshold: the LTV level at which your position becomes eligible for liquidation.",
          },
        ]}
      />
    </>
  )
}
