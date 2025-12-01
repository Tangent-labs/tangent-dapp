"use client"

import { ExistingAsset } from "@/types"
import { useMemo, useState } from "react"
import tokenInfos from "@/data/tokenInfos.json"
import { MarketDetailData } from "../../../tg_usd_type"
import TokenImage from "@/components/design_system/structure/token_image"

type TokenInfo = {
  info: string
  risk: string
}

type TokenInfosMap = Record<string, TokenInfo>

const typedTokenInfos = tokenInfos as TokenInfosMap

type MarketDetailsInfosProps = {
  marketData: MarketDetailData
}

export const MarketDetailsInfos = ({ marketData }: MarketDetailsInfosProps) => {
  const [tokenA, tokenB] = useMemo(() => {
    return marketData.collateralInfo.name.split("-") as [ExistingAsset, ExistingAsset]
  }, [marketData?.collateralInfo?.name])

  const [selectedToken, setSelectedToken] = useState<ExistingAsset>(tokenA)

  const currentInfo = useMemo(() => {
    const info = typedTokenInfos[selectedToken]
    return info ?? { info: "No information available", risk: "—" }
  }, [selectedToken])

  return (
    <div className="mt-4 hidden h-24 items-center rounded-[10px] bg-overlay-panel py-2 backdrop-blur-[60px] md:flex">
      <div className="flex min-h-20 w-2/12 flex-col items-center justify-center border-r border-[#3F3F3F] px-8">
        <span className="text-[15px] text-white">Assets</span>

        <div className="flex flex-col items-center justify-between gap-2 xl:flex-row">
          <button
            onClick={() => setSelectedToken(tokenA)}
            className={`mt-3 flex min-w-20 items-center justify-between rounded-full border border-white px-2 py-1 text-xs transition-all ${
              selectedToken === tokenA ? "border-opacity-100 bg-white text-black" : "border-opacity-20 text-white hover:border-opacity-100"
            }`}
          >
            <TokenImage token={tokenA as ExistingAsset} size={8} className="w-4" />
            {tokenA}
          </button>

          <button
            onClick={() => setSelectedToken(tokenB)}
            className={`mt-2 flex min-w-20 items-center justify-between rounded-full border border-white px-2 py-1 text-xs transition-all ${
              selectedToken === tokenB ? "border-opacity-100 bg-white text-black" : "border-opacity-20 text-white hover:border-opacity-100"
            }`}
          >
            <TokenImage token={tokenB as ExistingAsset} size={8} className="w-4" />
            {tokenB}
          </button>
        </div>
      </div>

      <div className="flex min-h-20 w-7/12 flex-col items-center justify-center border-r border-[#3F3F3F] px-4">
        <span className="text-sm text-white">Informations</span>

        <span className="mt-2 text-center text-xs text-subtitle">{currentInfo.info}</span>
      </div>

      <div className="flex min-h-20 w-3/12 flex-col items-center justify-center px-4 text-center">
        <span className="text-sm text-white">Risks</span>

        <span className="mt-2 text-xs text-subtitle">{currentInfo.risk}</span>
      </div>
    </div>
  )
}
