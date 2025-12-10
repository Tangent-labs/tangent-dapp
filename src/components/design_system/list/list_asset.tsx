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
      <TokenImage token={token} size={48} className="hidden sm:flex md:w-8 xl:w-16" />

      <div className="flex flex-row items-center justify-start gap-1 md:flex-col md:items-start">
        <span className="text-sm font-semibold md:text-xl">{name}</span>

        {marketData && (
          <>
            <div className="ml-2 flex items-center justify-between gap-2 md:hidden">
              {marketData?.marketType?.includes("CRV") && <TokenImage token={"CRV"} size={12} />}
              {marketData?.marketType?.startsWith("Convex_") && <TokenImage token={"CVX"} size={12} />}

              {marketData?.marketType?.startsWith("Pendle") && <TokenImage token={"PENDLE"} size={12} />}

              <span
                className={`mt-0.5 flex items-center justify-center bg-clip-text text-xs font-semibold text-transparent ${marketData?.constants?.irParams.isHEC ? "bg-button-active" : "bg-lec"}`}
              >
                {marketData?.constants?.irParams.isHEC ? "HEC" : "LEC"}
              </span>
            </div>
            <div className="hidden items-center justify-between gap-2 md:flex">
              {marketData?.marketType?.includes("CRV") && <Protocol token="CRV" label="Curve" />}

              {marketData?.marketType?.startsWith("Convex_") && <Protocol token="CVX" label="Convex" />}

              {marketData?.marketType?.startsWith("STAKEDAO") && <Protocol token="SDT" label="StakeDAO" />}

              {marketData?.marketType?.startsWith("Pendle") && <Protocol token="PENDLE" label="Pendle" />}

              <BorderPanel
                className={`flex items-center justify-center !rounded-full px-3 py-0.5 text-xs ${marketData?.constants?.irParams.isHEC ? "bg-button-active" : "bg-lec"}`}
              >
                {marketData?.constants?.irParams.isHEC ? "HEC" : "LEC"}
              </BorderPanel>
              <TokenImage token={"ETH"} size={20} />
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
