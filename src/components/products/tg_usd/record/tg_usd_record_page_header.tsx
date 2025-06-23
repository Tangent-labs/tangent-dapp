"use client"

import RecordPageHeader from "@/components/design_system/structure/record_page_header"
import IndicatorV2 from "@/components/design_system/structure/indicators_v2"
import TokenImage from "@/components/design_system/structure/token_image"
import { useTgUsdRecordContext } from "./tg_usd_record_context"
import { useRouter } from "next/navigation"
import BorderPanel from "@/components/design_system/structure/border_panel"

type TgUsdRecordPageHeaderProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default function TgUsdRecordPageHeader({ ...props }: TgUsdRecordPageHeaderProps) {
  const { collateralInfo, marketDisplayData, marketData, apr } = useTgUsdRecordContext()
  const router = useRouter()

  return (
    <>
      <div className="mt-4 flex justify-between" {...props}>
        <div className="flex items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
          <div className="flex items-center gap-2">
            <TokenImage token={collateralInfo.logo} size={64} />
            <span className="text-[24px] font-semibold">{collateralInfo.symbol}</span>
          </div>

          {marketData && (
            <>
              {marketData?.marketType?.includes("CRV") && (
                <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-4 py-0.5 text-xs">
                  <TokenImage token={"CRV"} size={16} />
                  <span className="text-sm">Curve</span>
                </div>
              )}
              {marketData?.marketType?.startsWith("Convex_") && (
                <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-4 py-0.5 text-xs">
                  <TokenImage token={"CVX"} size={16} />
                  <span className="text-sm">Convex</span>
                </div>
              )}

              <BorderPanel className="flex items-center justify-center !rounded-full bg-button-linear px-3 py-0.5 text-xs">
                {marketData?.constants?.irParams.isHEC ? "HEC" : "LEC"}
              </BorderPanel>
            </>
          )}
          <TokenImage token={"ETH"} size={20} />
        </div>

        <div className="flex items-end gap-4">
          <IndicatorV2 indicators={[{ title: "TVL", value: marketDisplayData.tvl }]} />
          <IndicatorV2 indicators={[{ title: "Borrowed", value: marketDisplayData.borrowed }]} />
          <IndicatorV2 indicators={[{ title: "Cap", value: marketDisplayData.cap }]} />

          <BorderPanel
            onClick={() => router.push("/")}
            className="flex h-10 cursor-pointer items-center rounded-[10px] bg-overlay-panel px-9 text-xs font-semibold backdrop-blur-[60px] transition-colors duration-200 ease-in-out hover:bg-white/10"
          >
            Back
          </BorderPanel>
        </div>
      </div>

      <RecordPageHeader
        apr={apr}
        indicators={[
          {
            title: "vAPR",
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
