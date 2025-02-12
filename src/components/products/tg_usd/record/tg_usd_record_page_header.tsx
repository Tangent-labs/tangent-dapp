"use client"

import { ButtonPanel } from "@/components/design_system/inputs/button_panel"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import Panel from "@/components/design_system/structure/panel"
import RecordPageHeader from "@/components/design_system/structure/record_page_header"
import TokenImage from "@/components/design_system/structure/token_image"
import React from "react"
import { useRouter } from "next/navigation"
import { useTgUsdRecordContext } from "./tg_usd_record_context"

type TgUsdRecordPageHeaderProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default function TgUsdRecordPageHeader({ ...props }: TgUsdRecordPageHeaderProps) {
  const { collateralInfo, marketDisplayData, marketData, apr } = useTgUsdRecordContext()

  const router = useRouter()

  return (
    <>
      <div className="mt-10 flex justify-between" {...props}>
        <div>
          <Panel>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <TokenImage token={collateralInfo.logo} size={32} />
                <span className="text-3xl">{collateralInfo.symbol}</span>
              </div>
              {marketData?.marketType?.includes("CRV") && (
                <div className="flex items-center gap-2 rounded-full border border-white border-opacity-[15%] px-4 py-1">
                  <TokenImage token={"CRV"} size={16} />
                  <span className="text-sm">Curve</span>
                </div>
              )}
              {marketData?.marketType?.startsWith("Convex_") && (
                <div className="flex items-center gap-2 rounded-full border border-white border-opacity-[15%] px-4 py-1">
                  <TokenImage token={"CVX"} size={16} />
                  <span className="text-sm">Convex</span>
                </div>
              )}
              <div>
                <TokenImage token={"ETH"} size={32} />
              </div>
            </div>
          </Panel>
        </div>
        <div className="flex items-center gap-4">
          <IndicatorCards indicators={[{ title: "TVL", value: marketDisplayData.tvl }]} />
          <IndicatorCards indicators={[{ title: "Borrowed", value: marketDisplayData.borrowed }]} />
          <IndicatorCards indicators={[{ title: "Cap", value: marketDisplayData.cap }]} />
          <ButtonPanel onClick={() => router.push("/")}>Back</ButtonPanel>
        </div>
      </div>
      <div>
        <RecordPageHeader
          apr={apr}
          indicators={[
            {
              title: "Borrow rate",
              value: (
                <div className="flex items-center gap-2">
                  <span className="text-base text-gray-400"> current:</span> <span>{marketDisplayData.borrowRateCurrent}</span>
                </div>
              ),
              subValue: (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400"> next:</span> <span>{marketDisplayData.borrowRateNext}</span>
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
      </div>
    </>
  )
}
