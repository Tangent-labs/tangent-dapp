"use client"

import { Address } from "viem"
import { CustomAssetDisplay } from "./custom_asset_display"
import { CollateralEmissionLabel } from "./collat_emission_label"
import { MarketConstants, USGMarketType } from "@/components/products/usg/usg_type"
import TokenImageHighlighted from "../structure/token_image_highlighted"

interface ListAssetProps {
  name: string
  token: string
  marketData?: {
    marketType: USGMarketType | undefined
    marketAddress: Address
    constants: MarketConstants
  } | null
  className?: string
}

export const ListAsset = ({ name, token, marketData, className = "" }: ListAssetProps) => {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <CustomAssetDisplay token={token} />

      <div className="flex h-6 flex-row items-center justify-center md:h-12 md:flex-col md:items-start">
        <span className="text-sm font-semibold md:text-[18px]">{name?.replaceAll("-", "/")}</span>

        {!!marketData ? (
          <>
            <div className="ml-2 flex items-center justify-center gap-1 md:ml-0 xl:gap-2">
              {(marketData?.marketType?.includes("CRV") || marketData?.marketType?.startsWith("Convex_")) && <TokenImageHighlighted token="CRV" size={24} />}
              {marketData?.marketType?.startsWith("Convex_") && <TokenImageHighlighted token="CVX" size={24} />}
              {marketData?.marketType?.startsWith("STAKEDAO") && <TokenImageHighlighted token="SDT" size={24} />}
              {marketData?.marketType?.startsWith("Pendle") && <TokenImageHighlighted token="PENDLE" size={24} />}
              {marketData?.marketType?.includes("FXN") && <TokenImageHighlighted token="FXN" size={24} />}

              <CollateralEmissionLabel isHEC={marketData?.constants?.irParams.isHEC}></CollateralEmissionLabel>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
