"use client"

import { useRouter } from "next/navigation"
import { CollateralCard } from "./collateral_selection"
import { useUSGRecordContext } from "./tg_usd_record_context"
import BorderPanel from "@/components/design_system/structure/border_panel"
import IndicatorV2 from "@/components/design_system/structure/indicators_v2"

export default function USGRecordPageHeader() {
  const { collateralInfo, marketDisplayData, marketData } = useUSGRecordContext()

  const router = useRouter()

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
    </>
  )
}
