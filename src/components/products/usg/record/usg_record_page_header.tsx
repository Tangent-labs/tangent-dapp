"use client"

import { cn } from "@/lib/utils"
import { useUSGRecordContext } from "./usg_record_context"
import IndicatorV2 from "@/components/design_system/structure/indicators_v2"
import { CollateralCard } from "./collat_selection_dropdown/collateral_selection"
import { NeonLightCard } from "@/components/design_system/structure/neon_light_card"

export default function USGRecordPageHeader() {
  const { collateralInfo, marketDisplayData, marketData } = useUSGRecordContext()

  return (
    <>
      <div className="flex w-full flex-col justify-between xl:flex-row">
        <CollateralCard collateralInfo={collateralInfo} marketData={marketData}></CollateralCard>

        <NeonLightCard
          className={cn(marketDisplayData?.tvlDollar === "-" ? "shimmer" : "", "mt-2 flex h-full w-full xl:mt-0 xl:w-1/2")}
          color1="#0077ffa3"
          color2="#0075FF"
        >
          <div className="flex h-full items-center gap-2 xl:gap-4">
            <div className="flex w-full items-center justify-between px-6 xl:gap-8">
              {[
                { key: "TVL", value: marketDisplayData?.tvlDollar },
                { key: "Borrowed", value: marketDisplayData?.borrowed },
                { key: "Cap", value: marketDisplayData?.cap },
              ].map((item, index) => (
                <div className="text-center" key={index}>
                  <div className="text-center text-xs text-subtitle">{item.key}</div>
                  <div className="mt-1 text-center text-sm font-semibold">{item.value}</div>
                </div>
              ))}

              <div className="hidden text-center xl:flex xl:flex-col">
                <div className="text-center text-xs text-subtitle">Available</div>
                <div className="mt-1 text-center text-sm font-semibold">{marketDisplayData?.available}</div>
              </div>
            </div>
          </div>
        </NeonLightCard>

        <div className="mt-2 flex items-end gap-1 md:hidden">
          <IndicatorV2 indicators={[{ title: "APR", value: "12%" }]} />
          <IndicatorV2 indicators={[{ title: "Borrow rate", value: marketDisplayData.borrowRateCurrent }]} />
          <IndicatorV2 indicators={[{ title: "LTV", value: marketDisplayData.maxLtv }]} />
        </div>
      </div>
    </>
  )
}
