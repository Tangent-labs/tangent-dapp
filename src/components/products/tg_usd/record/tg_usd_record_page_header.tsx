"use client"

import RecordPageHeader from "@/components/design_system/structure/record_page_header"
import IndicatorV2 from "@/components/design_system/structure/indicators_v2"
import TokenImage from "@/components/design_system/structure/token_image"
import { useTgUsdRecordContext } from "./tg_usd_record_context"
import { useRouter } from "next/navigation"

type TgUsdRecordPageHeaderProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default function TgUsdRecordPageHeader({ ...props }: TgUsdRecordPageHeaderProps) {
  const { collateralInfo, marketDisplayData, marketData, apr } = useTgUsdRecordContext()
  const router = useRouter()

  return (
    <>
      <div className="mt-4 flex justify-between" {...props}>
        <div className="flex items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
          <div className="flex items-center gap-2">
            <TokenImage token={collateralInfo.logo} size={32} />
            <span className="text-[24px] font-bold">{collateralInfo.symbol}</span>
          </div>

          {marketData && (
            <>
              {marketData?.marketType?.includes("CRV") && (
                <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-4 py-1 text-xs">
                  <TokenImage token={"CRV"} size={16} />
                  <span className="text-sm">Curve</span>
                </div>
              )}
              {marketData?.marketType?.startsWith("Convex_") && (
                <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-4 py-1 text-xs">
                  <TokenImage token={"CVX"} size={16} />
                  <span className="text-sm">Convex</span>
                </div>
              )}

              <div className="flex items-center justify-center rounded-full border border-white border-opacity-20 bg-button-linear px-2 py-1 text-xs">
                {marketData?.constants?.irParams.isHEC ? "HEC" : "LEC"}
              </div>
            </>
          )}
          <TokenImage token={"ETH"} size={24} />
        </div>

        <div className="flex items-end gap-4">
          <IndicatorV2 indicators={[{ title: "TVL", value: marketDisplayData.tvl }]} />
          <IndicatorV2 indicators={[{ title: "Borrowed", value: marketDisplayData.borrowed }]} />
          <IndicatorV2 indicators={[{ title: "Cap", value: marketDisplayData.cap }]} />

          <button
            onClick={() => router.push("/")}
            className="h-10 rounded-[10px] border border-white border-opacity-20 bg-overlay-panel px-9 text-xs font-bold backdrop-blur-[60px] hover:bg-white/10"
          >
            Back
          </button>
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
