"use client"

import { ExistingAsset } from "@/types"
import { MarketDetailData } from "../tg_usd_type"
import { MarketMetadata } from "./market_metadata"
import { IconChevron } from "@/components/icons/icon_chevron"
import USGModalMarketList from "../list/modal/modal_market_list"
import TokenImage from "@/components/design_system/structure/token_image"
import { USGMarketListProvider } from "../list/tg_usd_market_list_context"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

type CollateralCardProps = {
  collateralInfo: { logo: string; symbol: string }
  marketData?: MarketDetailData
}

export const CollateralCard = ({ collateralInfo, marketData }: CollateralCardProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          style={{ borderWidth: 1.5 }}
          className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[10px] border border-white/10 bg-overlay-panel p-2 backdrop-blur-[60px] hover:border-white/30 md:w-fit"
        >
          <div className="flex items-center gap-2">
            <TokenImage className="w-8 md:w-16" token={collateralInfo.logo as ExistingAsset} size={64} />
            <span className="text-sm font-semibold md:text-[24px]">{collateralInfo.symbol}</span>
          </div>

          <div className="flex items-center justify-between gap-2">{marketData && <MarketMetadata marketData={marketData} />}</div>

          <IconChevron className="w-3" />
        </div>
      </DialogTrigger>

      <DialogContent className="h-[640px] rounded-[10px] bg-overlay-panel p-4 text-white focus:outline-none">
        <USGMarketListProvider>
          <USGModalMarketList />
        </USGMarketListProvider>
      </DialogContent>
    </Dialog>
  )
}
