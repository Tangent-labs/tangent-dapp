"use client"

import { cn } from "@/lib/utils"
import { formatMillions } from "@/lib/number_formatter"
import { useUSGRecordContext } from "./usg_record_context"
import IndicatorV2 from "@/components/design_system/structure/indicators_v2"
import { CollateralCard } from "./collat_selection_dropdown/collateral_selection"
import { NeonLightCard } from "@/components/design_system/structure/neon_light_card"

export default function USGRecordPageHeader() {
  const { collateralInfo, marketDisplayData, marketData, currentTotalMarketApr } = useUSGRecordContext()

  return (
    <>
      <div className="flex w-full flex-col justify-between gap-0 xl:flex-row xl:gap-5">
        <CollateralCard className="w-full xl:w-5/12" collateralInfo={collateralInfo} marketData={marketData}></CollateralCard>

        <NeonLightCard
          paddingHorizontal={0} // No padding here because we already have space in this div
          className={cn(marketDisplayData?.tvlDollar === "-" ? "shimmer" : "", "mt-2 flex w-full xl:mt-0 xl:w-7/12")}
          color1="#0077ffa3"
          color2="#0075FF"
        >
          <div className="flex items-center gap-2 xl:gap-4">
            <div className="flex w-full items-center justify-between py-0.5">
              <div className="flex-1 text-center">
                <div className="text-center text-xs text-subtitle">TVL</div>
                <div className="mt-1 text-center text-sm font-semibold">${formatMillions(marketDisplayData?.tvlDollar)} </div>
              </div>

              {[
                { key: "Borrowed", value: marketDisplayData?.borrowed },
                { key: "Cap", value: marketDisplayData?.cap },
                { key: "Available", value: marketDisplayData?.available },
              ].map((item, index) => (
                <div className="flex-1 text-center xl:border-l xl:border-white/10" key={index}>
                  <div className="text-center text-xs text-subtitle">{item.key}</div>
                  <div className="mt-1 text-center text-sm font-semibold">{formatMillions(item.value)} USG</div>
                </div>
              ))}
            </div>
          </div>
        </NeonLightCard>

        {/* MOBILE COMPONENT */}
        <div className="mt-2 flex items-end gap-1 md:hidden">
          <IndicatorV2 indicators={[{ title: "Current vAPR", value: `${currentTotalMarketApr?.toFixed(2)}%` }]} />
          <IndicatorV2 indicators={[{ title: "Borrow rate", value: `${((Math.exp(marketDisplayData.borrowRateCurrent) - 1) * 100).toFixed(2)}%` }]} />
          <IndicatorV2 indicators={[{ title: "Max LTV", value: marketDisplayData.maxLtv }]} />
        </div>
      </div>
    </>
  )
}
