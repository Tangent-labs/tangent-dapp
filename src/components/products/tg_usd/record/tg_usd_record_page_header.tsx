"use client"

import { ButtonPanel } from "@/components/design_system/inputs/button_panel"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import Panel from "@/components/design_system/structure/panel"
import RecordPageHeader from "@/components/design_system/structure/record_page_header"
import TokenImage from "@/components/design_system/structure/token_image"
import { formatNumber, formatPercent } from "@/lib/number_formatter"
import React from "react"

type TgUsdRecordPageHaderProps = React.ButtonHTMLAttributes<HTMLDivElement> & { onBackClick: () => void }

export default function TgUsdRecordPageHader({ onBackClick, ...props }: TgUsdRecordPageHaderProps) {
  return (
    <>
      <div className="mt-10 flex justify-between" {...props}>
        <div>
          <Panel>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <TokenImage token={"TRICRV"} size={32} />
                <span className="text-3xl">TRICRV</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white border-opacity-[15%] px-4 py-1">
                <TokenImage token={"CRV"} size={16} />
                <span className="text-sm">Curve</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white border-opacity-[15%] px-4 py-1">
                <TokenImage token={"CVX"} size={16} />
                <span className="text-sm">Convex</span>
              </div>
              <div>
                <TokenImage token={"ETH"} size={32} />
              </div>
            </div>
          </Panel>
        </div>
        <div className="flex items-center gap-4">
          <IndicatorCards indicators={[{ title: "TVL", value: formatPercent(100000, 2) }]} />
          <IndicatorCards indicators={[{ title: "Borrowed", value: formatNumber(100000, 0) }]} />
          <IndicatorCards indicators={[{ title: "Cap", value: formatPercent(100000, 2) }]} />
          <ButtonPanel onClick={onBackClick}>Back</ButtonPanel>
        </div>
      </div>
      <div>
        <RecordPageHeader
          token={"TRICRV"}
          apr={{
            actualsApr: {
              details: { baseApr: 0.03, boostApr: 0.02, type: "variable" },
              totalApr: 0,
            },
            projectedApr: {
              details: { baseApr: 0.03, boostApr: 0.02, type: "variable" },
              totalApr: 0,
            },
            boostsData: {},
          }}
          indicators={[
            {
              title: "TVL",
              value: 52222,
              subValue: 54654656,
            },
            {
              title: "Deposited",
              value: 15,
              subValue: 2522,
            },
            {
              title: "Claimable",
              value: 25,
              subValue: 865,
            },
          ]}
        />
      </div>
    </>
  )
}
