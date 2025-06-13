"use client"

import { ExistingAsset } from "@/types"
import TokenImage from "@/components/design_system/structure/token_image"
import { ChainViewMarketRow } from "@/components/products/tg_usd/tg_usd_type"

interface ListAssetProps {
  name: string
  token: ExistingAsset
  assetsEarned?: { token: ExistingAsset }[]
  marketData?: ChainViewMarketRow | null
  className?: string
}

const ListAsset = ({ name, token, assetsEarned, marketData, className = "" }: ListAssetProps) => {
  return (
    <div className={`relative flex items-center gap-4 ${className}`}>
      <TokenImage token={token} size={48} className="w-20" />

      <div className="flex flex-col leading-8">
        <span className="text-[20px] font-semibold">{name}</span>

        {marketData && (
          <div className="flex items-center justify-between gap-2">
            {marketData?.marketType?.includes("CRV") && (
              <div className="flex items-center justify-center gap-2 rounded-full border border-white border-opacity-20 bg-overlay-panel px-4 py-1 text-xs">
                <TokenImage token={"CRV"} size={12} />
                <span>Curve</span>
              </div>
            )}
            {marketData?.marketType?.startsWith("Convex_") && (
              <div className="flex items-center justify-center gap-2 rounded-full border border-white border-opacity-20 bg-overlay-panel px-4 py-1 text-xs">
                <TokenImage token={"CVX"} size={12} />
                <span>Convex</span>
              </div>
            )}

            {marketData?.marketType?.startsWith("Pendle") && (
              <div className="flex items-center justify-center gap-2 rounded-full border border-white border-opacity-20 bg-overlay-panel px-4 py-1 text-xs">
                <TokenImage token={"PENDLE"} size={12} />
                <span>Convex</span>
              </div>
            )}

            <div className="flex items-center justify-center rounded-full border border-white border-opacity-20 bg-button-linear px-3 py-1 text-xs">
              {marketData?.constants?.irParams.isHEC ? "HEC" : "LEC"}
            </div>
            <TokenImage token={"ETH"} size={24} />
          </div>
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
