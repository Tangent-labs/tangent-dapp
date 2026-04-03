"use client"

import { MarketConstants, USGMarketType } from "../usg_type"
import { CollateralEmissionLabel } from "@/components/design_system/list/collat_emission_label"
import TokenImageHighlighted from "@/components/design_system/structure/token_image_highlighted"

type MarketMetadataProps = {
  marketData: {
    constants: MarketConstants
    marketType?: USGMarketType
  }
}

export const MarketMetadata = ({ marketData }: MarketMetadataProps) => {
  return (
    <div className="flex items-center justify-between gap-[5px]">
      {(marketData?.marketType?.includes("CRV") || marketData?.marketType?.startsWith("Convex_")) && <TokenImageHighlighted token="CRV" size={24} />}
      {marketData?.marketType?.startsWith("Convex_") && <TokenImageHighlighted token="CVX" size={24} />}
      {marketData?.marketType?.startsWith("STAKEDAO") && <TokenImageHighlighted token="SDT" size={24} />}
      {marketData?.marketType?.startsWith("Pendle") && <TokenImageHighlighted token="PENDLE" size={24} />}
      {marketData?.marketType?.includes("FXN") && <TokenImageHighlighted token="FXN" size={24} />}

      <CollateralEmissionLabel isHEC={marketData?.constants?.irParams.isHEC}></CollateralEmissionLabel>
    </div>
  )
}
