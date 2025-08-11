"use client"

import RecordPageHeader from "@/components/design_system/structure/record_page_header"
import IndicatorV2 from "@/components/design_system/structure/indicators_v2"
import TokenImage from "@/components/design_system/structure/token_image"
import { useTgUsdRecordContext } from "./tg_usd_record_context"
import { useRouter } from "next/navigation"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { MarketMetadata } from "./market_metadata"

export default function TgUsdRecordPageHeader() {
  const { collateralInfo, marketDisplayData, marketData, apr } = useTgUsdRecordContext()

  const router = useRouter()

  return (
    <>
      <div className="mt-4 flex flex-col justify-between xl:flex-row">
        <div className="flex w-full items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px] md:w-fit">
          <div className="flex items-center gap-2">
            <TokenImage className="w-8 md:w-16" token={collateralInfo.logo} size={64} />
            <span className="text-[14px] font-semibold md:text-[24px]">{collateralInfo.symbol}</span>
          </div>

          <div className="flex items-center justify-between gap-2">{marketData && <MarketMetadata marketData={marketData}></MarketMetadata>}</div>
        </div>

        <div className="mt-4 flex items-end gap-4 xl:mt-0">
          <IndicatorV2 indicators={[{ title: "TVL", value: marketDisplayData.tvl }]} />
          <IndicatorV2 indicators={[{ title: "Borrowed", value: marketDisplayData.borrowed }]} />
          <IndicatorV2 indicators={[{ title: "Cap", value: marketDisplayData.cap }]} />

          <BorderPanel
            onClick={() => router.push("/")}
            className="hidden h-10 cursor-pointer items-center rounded-[10px] bg-overlay-panel px-9 text-xs font-semibold backdrop-blur-[60px] transition-colors duration-200 ease-in-out hover:bg-white/10 xl:flex"
          >
            Back
          </BorderPanel>
        </div>
      </div>

      <RecordPageHeader
        apr={apr}
        indicators={[
          {
            title: "APR",
            value: "12%",
            subValue: "15%",
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
                <span className="text-sm text-gray-400"> Proj:</span> <span>{marketDisplayData.borrowRateNext}</span>
              </div>
            ),
          },
          {
            title: "Rewards cut",
            value: marketDisplayData.rewardsCutCurrent,
            subValue: marketDisplayData.rewardsCutNext,
          },
          {
            title: "LTV",
            value: marketDisplayData.maxLtv,
            subValue: null,
          },
          {
            title: "LT",
            value: marketDisplayData.lt,
            subValue: null,
          },
        ]}
      />
    </>
  )
}
