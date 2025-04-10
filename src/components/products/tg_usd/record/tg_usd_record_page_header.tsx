"use client"

import { ButtonPanel } from "@/components/design_system/inputs/button_panel"
import RecordPageHeader from "@/components/design_system/structure/record_page_header"
import TokenImage from "@/components/design_system/structure/token_image"
import React from "react"
import { useRouter } from "next/navigation"
import { useTgUsdRecordContext } from "./tg_usd_record_context"
import IndicatorV2 from "@/components/design_system/structure/indicators_v2"

type TgUsdRecordPageHeaderProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default function TgUsdRecordPageHeader({ ...props }: TgUsdRecordPageHeaderProps) {
  const { collateralInfo, marketDisplayData, marketData, apr } = useTgUsdRecordContext()

  const router = useRouter()

  return (
    <>
      <div className="mt-10 flex justify-between" {...props}>
        <div className="flex items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
          <div className="flex items-center gap-2">
            <TokenImage token={collateralInfo.logo} size={32} />
            <span className="text-[24px] font-bold">{collateralInfo.symbol}</span>
          </div>
          {marketData?.marketType?.includes("CRV") && (
            <div className="flex items-center gap-2 rounded-full bg-overlay-panel px-4 py-1">
              <TokenImage token={"CRV"} size={16} />
              <span className="text-sm">Curve</span>
            </div>
          )}
          {marketData?.marketType?.startsWith("Convex_") && (
            <div className="flex items-center gap-2 rounded-full bg-overlay-panel px-4 py-1">
              <TokenImage token={"CVX"} size={16} />
              <span className="text-sm">Convex</span>
            </div>
          )}

          <TokenImage token={"ETH"} size={32} />
        </div>

        <div className="flex gap-4">
          <IndicatorV2 indicators={[{ title: "TVL", value: marketDisplayData.tvl }]} />
          <IndicatorV2 indicators={[{ title: "Borrowed", value: marketDisplayData.borrowed }]} />
          <IndicatorV2 indicators={[{ title: "Cap", value: marketDisplayData.cap }]} />
          <ButtonPanel onClick={() => router.push("/")}>Back</ButtonPanel>
        </div>
      </div>

      <RecordPageHeader
        apr={apr}
        indicators={[
          {
            title: "APR",
            value: marketDisplayData.rewardsCutCurrent,
            subValue: marketDisplayData.rewardsCutNext,
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
            title: "max. LTV",
            value: marketDisplayData.maxLtv,
            subValue: marketDisplayData.maxLtvDollar,
          },
          {
            title: "LT",
            value: marketDisplayData.lt,
            subValue: marketDisplayData.ltDollar,
          },
        ]}
      />
    </>
  )
}
