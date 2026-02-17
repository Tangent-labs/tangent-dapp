"use client"

import { ExistingAsset } from "@/types"
import { useMemo, useState } from "react"
import { MarketDetailData } from "../../../usg_type"
import TokenImage from "@/components/design_system/structure/token_image"
import { IconArrow } from "@/components/icons"
import { TOKEN_INFOS } from "@/data/tokenInfos"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

type MarketDetailsInfosProps = {
  marketData: MarketDetailData
}

export const MarketDetailsInfos = ({ marketData }: MarketDetailsInfosProps) => {
  const [tokenA, tokenB] = useMemo(() => {
    return marketData.collateralInfo.name.split("-") as [ExistingAsset, ExistingAsset | string]
  }, [marketData?.collateralInfo?.name])

  const [selectedToken, setSelectedToken] = useState<ExistingAsset | string>(tokenA)

  const currentInfo = useMemo(() => {
    const info = TOKEN_INFOS[selectedToken]
    return info ?? { info: "No information available", risk: "—" }
  }, [selectedToken])

  const onClickTokenLink = (token: ExistingAsset) => {
    const infoToDisplay = TOKEN_INFOS[token]
    window.open(infoToDisplay?.link, "_blank")
  }

  return (
    <ReliefCard className="mt-4 hidden h-24 items-center py-2 md:flex">
      <div className="flex min-h-20 w-2/12 flex-col items-center justify-center border-r border-[#3F3F3F] px-8">
        <div className="flex flex-col items-center justify-between gap-2">
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              onClick={() => setSelectedToken(tokenA)}
              className={`flex min-w-20 items-center justify-between gap-2 rounded-full border border-white px-2 py-0.5 text-xs transition-all ${
                selectedToken === tokenA ? "border-opacity-100 bg-white text-black" : "border-opacity-20 text-white hover:border-opacity-100"
              }`}
            >
              <TokenImage token={tokenA as ExistingAsset} size={8} className="w-4" />
              {tokenA}
            </button>

            <div
              onClick={() => onClickTokenLink(tokenA)}
              className="relative flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full border border-subtitle hover:border-white"
            >
              <div className="absolute flex items-center justify-center">
                <IconArrow className="w-4 fill-white"></IconArrow>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            {tokenB && tokenB !== "" && (
              <>
                <button
                  onClick={() => setSelectedToken(tokenB)}
                  className={`mt-1 flex min-w-20 items-center justify-between rounded-full border border-white px-2 py-0.5 text-xs transition-all ${
                    selectedToken === tokenB ? "border-opacity-100 bg-white text-black" : "border-opacity-20 text-white hover:border-opacity-100"
                  }`}
                >
                  <TokenImage token={tokenB as ExistingAsset} size={8} className="w-4" />
                  {tokenB}
                </button>
                <div
                  onClick={() => onClickTokenLink(tokenB as ExistingAsset)}
                  className="relative flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full border border-subtitle hover:border-white"
                >
                  <div className="absolute flex items-center justify-center">
                    <IconArrow className="w-4 fill-white"></IconArrow>
                  </div>
                </div>
              </>
            )}
          </div>
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
    </ReliefCard>
  )
}
