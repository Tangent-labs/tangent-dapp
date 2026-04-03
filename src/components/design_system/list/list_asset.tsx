"use client"

import { Address } from "viem"
import { CustomAssetDisplay } from "./custom_asset_display"
import { MarketMetadata } from "@/components/products/usg/record/market_metadata"
import { MarketConstants, USGMarketType } from "@/components/products/usg/usg_type"

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

      <div className="flex h-6 flex-row items-center justify-center gap-2 md:h-12 md:flex-col md:items-start md:gap-0">
        <span className="text-sm font-semibold md:text-[18px]">{name?.replaceAll("-", "/")}</span>

        {marketData && <MarketMetadata marketData={marketData} />}
      </div>
    </div>
  )
}
