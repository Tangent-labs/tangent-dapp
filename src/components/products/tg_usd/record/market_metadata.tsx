"use client"

import TokenImage from "@/components/design_system/structure/token_image"
import { MarketDetailData } from "../tg_usd_type"
import BorderPanel from "@/components/design_system/structure/border_panel"

type MarketMetadataProps = {
  marketData: MarketDetailData
}

export const MarketMetadata = ({ marketData }: MarketMetadataProps) => {
  return (
    <>
      {marketData && (
        <>
          {marketData?.marketType?.includes("CRV") && (
            <>
              <div className="hidden items-center justify-center gap-2 rounded-full bg-overlay-panel px-4 py-0.5 text-xs md:flex">
                <TokenImage token={"CRV"} size={16} />
                <span className="flex text-sm">Curve</span>
              </div>

              <TokenImage className="flex text-sm md:hidden" token={"CRV"} size={20} />
            </>
          )}
          {marketData?.marketType?.startsWith("Convex_") && (
            <>
              <div className="hidden items-center justify-center gap-2 rounded-full bg-overlay-panel px-4 py-0.5 text-xs md:flex">
                <TokenImage token={"CVX"} size={16} />
                <span className="flex text-sm">Convex</span>
              </div>
              <TokenImage className="flex text-sm md:hidden" token={"CVX"} size={20} />
            </>
          )}

          <BorderPanel className="flex items-center justify-center !rounded-full bg-button-linear px-3 py-0.5 text-xs">
            {marketData?.constants?.irParams.isHEC ? "HEC" : "LEC"}
          </BorderPanel>
        </>
      )}
      <TokenImage token={"ETH"} size={20} />
    </>
  )
}
