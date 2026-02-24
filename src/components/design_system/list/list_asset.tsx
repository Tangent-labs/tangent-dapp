"use client"

import { Address } from "viem"
import { ExistingAsset } from "@/types"
import { CustomAssetDisplay } from "./custom_asset_display"
import { MarketConstants } from "@/components/products/usg/usg_type"
import { TokenImage } from "@/components/design_system/structure/token_image"

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

export const ListAsset = ({ name, token, assetsEarned, marketData, className = "" }: ListAssetProps) => {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <CustomAssetDisplay token={token} />

      <div className="flex flex-row items-center justify-start gap-1 md:flex-col md:items-start">
        <span className="text-sm font-semibold md:text-xl">{name}</span>

        {marketData && (
          <>
            <div className="ml-2 flex items-center justify-between gap-2 md:hidden">
              {marketData?.marketType?.includes("CRV") && <TokenImage token={"CRV"} size={12} />}
              {marketData?.marketType?.startsWith("Convex_") && <TokenImage token={"CVX"} size={12} />}
              {marketData?.marketType?.startsWith("STAKEDAO") && <TokenImage token={"SDT"} size={12} />}
              {marketData?.marketType?.startsWith("Pendle") && <TokenImage token={"PENDLE"} size={12} />}

              <span className="mt-0.5 flex items-center justify-center text-xs font-semibold">{marketData?.constants?.irParams.isHEC ? "HEC" : "LEC"}</span>
            </div>
            <div className="hidden items-center justify-between gap-2 md:flex">
              {marketData?.marketType?.includes("CRV") && <TokenImage token="CRV" size={12} />}
              {marketData?.marketType?.startsWith("Convex_") && <TokenImage token="CVX" size={12} />}
              {marketData?.marketType?.startsWith("STAKEDAO") && <TokenImage token="SDT" size={12} />}
              {marketData?.marketType?.startsWith("Pendle") && <TokenImage token="PENDLE" size={12} />}
              {marketData?.marketType?.includes("FXN") && <TokenImage token="FXN" size={12} />}

              <span className={`flex items-center justify-center rounded-full bg-overlay-panel px-3 py-0.5 text-xs backdrop-blur-[60px]`}>
                {marketData?.constants?.irParams.isHEC ? "HEC" : "LEC"}
              </span>
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
