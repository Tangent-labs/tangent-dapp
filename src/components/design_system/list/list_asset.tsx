"use client"

import { Address } from "viem"
import { ExistingAsset } from "@/types"
import { CustomAssetDisplay } from "./custom_asset_display"
import { CollateralEmissionLabel } from "./collat_emission_label"
import { MarketConstants } from "@/components/products/usg/usg_type"
import TokenImageHighlighted from "../structure/token_image_highlighted"

interface ListAssetProps {
  name: string
  token: ExistingAsset
  marketData?: {
    marketType: "Convex_CRV" | "Convex_FXN" | "Pendle_PT" | "STAKEDAO_CRV_Vault" | undefined
    marketAddress: Address
    constants: MarketConstants
  } | null
  className?: string
}

export const ListAsset = ({ name, token, marketData, className = "" }: ListAssetProps) => {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <CustomAssetDisplay token={token} />

      <div className="flex flex-row items-center justify-start md:flex-col md:items-start">
        <span className="text-sm font-semibold md:text-xl">{name}</span>

        <div className="ml-2 flex h-6 items-center justify-center gap-1 md:ml-0 xl:gap-2">
          {marketData && (
            <>
              {marketData?.marketType?.includes("CRV") && <TokenImageHighlighted token="CRV" size={24} />}
              {marketData?.marketType?.startsWith("Convex_") && <TokenImageHighlighted token="CVX" size={24} />}
              {marketData?.marketType?.startsWith("STAKEDAO") && <TokenImageHighlighted token="SDT" size={24} />}
              {marketData?.marketType?.startsWith("Pendle") && <TokenImageHighlighted token="PENDLE" size={24} />}
              {marketData?.marketType?.includes("FXN") && <TokenImageHighlighted token="FXN" size={24} />}

              <CollateralEmissionLabel isHEC={marketData?.constants?.irParams.isHEC}></CollateralEmissionLabel>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
