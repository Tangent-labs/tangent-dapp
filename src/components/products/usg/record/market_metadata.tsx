"use client"

import { Address } from "viem"
import Image from "next/image"
import { MarketConstants, USGMarketType } from "../usg_type"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { CollateralEmissionLabel } from "@/components/design_system/list/collat_emission_label"
import TokenImageHighlighted from "@/components/design_system/structure/token_image_highlighted"

type MarketMetadataProps = {
  marketData: {
    marketType?: USGMarketType | undefined
    marketAddress: Address
    constants: MarketConstants
  }
}

const BOLD_MARKET_ADDRESS = "0xC9c80e8481c2B6f979AFc155bc3F979cfAD19c56"

export const MarketMetadata = ({ marketData }: MarketMetadataProps) => {
  return (
    <div className="flex items-center justify-between gap-[5px]">
      {(marketData?.marketType?.includes("CRV") || marketData?.marketType?.startsWith("Convex_")) && <TokenImageHighlighted token="CRV" size={24} />}
      {marketData?.marketType?.startsWith("Convex_") && <TokenImageHighlighted token="CVX" size={24} />}
      {marketData?.marketType?.startsWith("STAKEDAO") && <TokenImageHighlighted token="SDT" size={24} />}
      {marketData?.marketType?.startsWith("Pendle") && <TokenImageHighlighted token="PENDLE" size={24} />}
      {marketData?.marketType?.includes("FXN") && <TokenImageHighlighted token="FXN" size={24} />}

      <LiquityBadge address={marketData?.marketAddress?.toLowerCase()} />

      <CollateralEmissionLabel isHEC={marketData?.constants?.irParams.isHEC}></CollateralEmissionLabel>
    </div>
  )
}

type LiquityBadgeProps = {
  address: string
}

const LiquityBadge = ({ address }: LiquityBadgeProps) => {
  return (
    <>
      {address === BOLD_MARKET_ADDRESS?.toLowerCase() && (
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Image
              className="flex items-center justify-center rounded-full bg-overlay-panel p-1.5 backdrop-blur-[60px] hover:bg-white/10"
              src="/medias/tokens/liquity.webp"
              alt="liquity"
              width={24}
              height={24}
            />
          </HoverCardTrigger>
          <HoverCardContent side="top" align="center" className="z-[9999] flex justify-center p-2 text-sm">
            Borrow and earn points on
            <span
              className="ml-1 cursor-pointer text-white underline hover:text-white/30"
              onClick={(e) => {
                e?.stopPropagation()
                e?.preventDefault()
                window.open("https://liquity.app/", "_blank", "noopener,noreferrer")
              }}
            >
              Liquity protocol.
            </span>
          </HoverCardContent>
        </HoverCard>
      )}
    </>
  )
}
