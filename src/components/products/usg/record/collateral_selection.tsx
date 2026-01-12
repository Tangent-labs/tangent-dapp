"use client"

import { ExistingAsset } from "@/types"
import { MarketDetailData } from "../usg_type"
import { IconChevron } from "@/components/icons"
import { MarketMetadata } from "./market_metadata"
import { specialTokensList } from "../usg_repository"
import USGModalMarketList from "../list/modal/modal_market_list"
import { USGMarketListProvider } from "../list/usg_market_list_context"
import TokenImage from "@/components/design_system/structure/token_image"
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
          className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[10px] bg-overlay-panel px-4 py-2 backdrop-blur-[60px] transition-colors duration-200 ease-in-out hover:bg-white/10 md:w-fit"
        >
          <div className="flex items-center gap-2">
            {specialTokensList.includes(collateralInfo.logo?.substring(0, collateralInfo.logo.indexOf(" ")).trim()) ? (
              <TokenImage token={collateralInfo.logo as ExistingAsset} size={32} className="w-6 md:w-10" />
            ) : (
              <TokenImage token={collateralInfo.logo as ExistingAsset} size={32} className="w-8 md:w-16" />
            )}

            <span className="text-sm font-semibold md:text-[24px]">{collateralInfo.symbol}</span>
          </div>

          <div className="flex items-center justify-between gap-2">{marketData && <MarketMetadata marketData={marketData} />}</div>

          <IconChevron className="w-3 stroke-white" />
        </div>
      </DialogTrigger>

      <DialogContent className="h-[640px] max-w-[763px] rounded-[10px] bg-overlay-panel p-4 text-white focus:outline-none">
        <USGMarketListProvider>
          <USGModalMarketList />
        </USGMarketListProvider>
      </DialogContent>
    </Dialog>
  )
}
