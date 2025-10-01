"use client"

import { useRouter } from "next/navigation"
import { MarketMetadata } from "./market_metadata"
import { useUSGRecordContext } from "./tg_usd_record_context"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import IndicatorV2 from "@/components/design_system/structure/indicators_v2"
import RecordPageHeader from "@/components/design_system/structure/record_page_header"

export default function USGRecordPageHeader() {
  const { collateralInfo, marketDisplayData, marketData, apr } = useUSGRecordContext()

  const router = useRouter()

  return (
    <>
      <div className="mt-4 flex flex-col justify-between xl:flex-row">
        <div className="flex w-full items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px] md:w-fit">
          <div className="flex items-center gap-2">
            <TokenImage className="w-8 md:w-16" token={collateralInfo.logo} size={64} />
            <span className="text-sm font-semibold md:text-[24px]">{collateralInfo.symbol}</span>
          </div>

          <div className="flex items-center justify-between gap-2">{marketData && <MarketMetadata marketData={marketData}></MarketMetadata>}</div>
        </div>

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
        apr={apr}
        indicators={[
          {
            title: "APR",
            value: "12%",
            subValue: "15%",
            indicator: "vAPR of the collateral",
          },
          {
            title: "Borrow rate",
            value: (
              <div className="flex items-center gap-2">
                <span>{marketDisplayData.borrowRateCurrent}</span>
              </div>
            ),
            subValue: (
              <div className="flex items-center gap-2">
                <span className="text-sm text-subtitle"> Proj:</span> <span>{marketDisplayData.borrowRateNext}</span>
              </div>
            ),
            indicator: "Interest rate that borrowers pay on their outstanding debt",
          },
          {
            title: "Rewards cut",
            value: marketDisplayData.rewardsCutCurrent,
            subValue: marketDisplayData.rewardsCutNext,
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
