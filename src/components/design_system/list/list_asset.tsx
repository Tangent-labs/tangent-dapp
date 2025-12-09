"use client"

import { Address } from "viem"
import { Protocol } from "./protocol"
import { ExistingAsset } from "@/types"
import BorderPanel from "../structure/border_panel"
import TokenImage from "@/components/design_system/structure/token_image"
import { MarketConstants } from "@/components/products/tg_usd/tg_usd_type"

interface ListAssetProps {
  name: string
  token: ExistingAsset
  assetsEarned?: { token: ExistingAsset }[]
  marketData?: { marketType: "Convex_CRV" | "Convex_FXN" | "Pendle_PT" | undefined; marketAddress: Address; constants: MarketConstants } | null
  className?: string
}

const ListAsset = ({ name, token, assetsEarned, marketData, className = "" }: ListAssetProps) => {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <TokenImage token={token} size={48} className="w-8 xl:w-16" />

      <div className="flex flex-col gap-1 leading-8">
        <span className="text-sm font-semibold md:text-xl">{name}</span>

        {marketData && (
          <div className="hidden items-center justify-between gap-2 md:flex">
            {marketData?.marketType?.includes("CRV") && <Protocol token="CRV" label="Curve" />}

            {marketData?.marketType?.startsWith("Convex_") && <Protocol token="CVX" label="Convex" />}

            {marketData?.marketType?.startsWith("STAKEDAO") && <Protocol token="SDT" label="StakeDAO" />}

            {marketData?.marketType?.startsWith("Pendle") && <Protocol token="PENDLE" label="Pendle" />}

            <BorderPanel
              className={`flex items-center justify-center !rounded-full px-3 py-0.5 text-xs ${marketData?.constants?.irParams.isHEC ? "bg-button-linear" : "bg-lec"}`}
            >
              {marketData?.constants?.irParams.isHEC ? "HEC" : "LEC"}
            </BorderPanel>
            <TokenImage token={"ETH"} size={20} />
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
