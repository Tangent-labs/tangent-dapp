"use client"

import { Address } from "viem"
import { ExistingAsset } from "@/types"
import { CustomAssetDisplay } from "./custom_asset_display"
import { MarketConstants } from "@/components/products/usg/usg_type"
import TokenImage from "@/components/design_system/structure/token_image"
import TokenImageHighlighted from "../structure/token_image_highlighted"
import { CollateralEmissionLabel } from "./collat_emission_label"

interface ListAssetProps {
  name: string
  token: ExistingAsset
  assetsEarned?: { token: ExistingAsset }[]
  marketData?: {
    marketType: "Convex_CRV" | "Convex_FXN" | "Pendle_PT" | "STAKEDAO_CRV_Vault" | undefined
    marketAddress: Address
    constants: MarketConstants
  } | null
  className?: string
}

const ListAsset = ({ name, token, assetsEarned, marketData, className = "" }: ListAssetProps) => {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <CustomAssetDisplay token={token} />

      <div className="flex flex-row items-center justify-start gap-1 md:flex-col md:items-start">
        <span className="text-sm font-semibold md:text-xl">{name}</span>

        {marketData && (
          <>
            <div className="ml-2 flex items-center justify-between gap-2 md:hidden">
              {marketData?.marketType?.includes("CRV") && <TokenImageHighlighted token={"CRV"} size={24} />}
              {marketData?.marketType?.startsWith("Convex_") && <TokenImageHighlighted token={"CVX"} size={24} />}
              {marketData?.marketType?.startsWith("STAKEDAO") && <TokenImageHighlighted token={"SDT"} size={24} />}
              {marketData?.marketType?.startsWith("Pendle") && <TokenImageHighlighted token={"PENDLE"} size={24} />}
              {marketData?.marketType?.includes("FXN") && <TokenImageHighlighted token="FXN" size={24} />}

              <CollateralEmissionLabel isHEC={marketData?.constants?.irParams.isHEC}></CollateralEmissionLabel>
            </div>
            <div className="hidden items-center justify-between gap-2 md:flex">
              {marketData?.marketType?.includes("CRV") && <TokenImageHighlighted token="CRV" size={24} />}
              {marketData?.marketType?.startsWith("Convex_") && <TokenImageHighlighted token="CVX" size={24} />}
              {marketData?.marketType?.startsWith("STAKEDAO") && <TokenImageHighlighted token="SDT" size={24} />}
              {marketData?.marketType?.startsWith("Pendle") && <TokenImageHighlighted token="PENDLE" size={24} />}
              {marketData?.marketType?.includes("FXN") && <TokenImageHighlighted token="FXN" size={24} />}

              <CollateralEmissionLabel isHEC={marketData?.constants?.irParams.isHEC}></CollateralEmissionLabel>
            </div>
          </>
        )}

        {assetsEarned && assetsEarned?.length > 0 && (
          <div className="flex gap-2">
            <span className="text-xs">Earn :</span>
            {assetsEarned.map((earn) => (
              <div key={earn.token} className="flex items-center">
                <TokenImage token={earn.token} size={16} />
                <span className="sr-only">{earn.token}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ListAsset
