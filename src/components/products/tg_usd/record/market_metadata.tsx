"use client"

import { MarketDetailData } from "../tg_usd_type"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { MobileProtocol } from "@/components/design_system/list/mobile_protocol"

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
              <MobileProtocol token="CRV" label="Curve" />
              <TokenImage className="flex text-sm md:hidden" token={"CRV"} size={20} />
            </>
          )}

          {marketData?.marketType?.startsWith("Convex_") && (
            <>
              <MobileProtocol token="CVX" label="Convex" />
              <TokenImage className="flex text-sm md:hidden" token={"CVX"} size={20} />
            </>
          )}

          {marketData?.marketType?.startsWith("STAKEDAO") && (
            <>
              <MobileProtocol token="SDT" label="StakeDAO" />
              <TokenImage className="flex text-sm md:hidden" token={"SDT"} size={20} />
            </>
          )}

          <BorderPanel
            className={`flex items-center justify-center !rounded-full px-3 py-0.5 text-xs ${marketData?.constants?.irParams.isHEC ? "bg-button-linear" : "bg-lec"}`}
          >
            {marketData?.constants?.irParams.isHEC ? "HEC" : "LEC"}
          </BorderPanel>
        </>
      )}
      <TokenImage token={"ETH"} size={20} />
    </>
  )
}
