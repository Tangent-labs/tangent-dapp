"use client"

import { MarketDetailData } from "../../usg_type"
import { IconChevron } from "@/components/icons"
import { MarketMetadata } from "../market_metadata"
import { specialTokensList } from "../../usg_repository"
import { USGModalMarketList } from "../../list/modal/modal_market_list"
import { USGMarketListProvider } from "../../list/usg_market_list_context"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

type CollateralCardProps = {
  collateralInfo: { logoKey: string; symbol: string }
  marketData?: MarketDetailData
}

export const CollateralCard = ({ collateralInfo, marketData }: CollateralCardProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <ReliefCard className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-2 transition-colors duration-200 ease-in-out hover:bg-white/10 md:w-fit">
          <div className="flex items-center gap-2">
            {specialTokensList.includes(collateralInfo?.logoKey?.substring(0, collateralInfo?.logoKey.indexOf(" ")).trim()) ? (
              <TokenImage token={collateralInfo?.logoKey} size={32} className="w-6 md:w-10" />
            ) : (
              <TokenImage token={collateralInfo?.logoKey} size={32} className="w-8 md:w-16" />
            )}

            <span className="text-sm font-semibold md:text-[24px]">{collateralInfo?.symbol}</span>
          </div>

          <div className="flex items-center justify-between gap-2">{marketData && <MarketMetadata marketData={marketData} />}</div>

          <IconChevron className="w-3 stroke-white" />
        </ReliefCard>
      </DialogTrigger>

      <DialogContent className="h-[640px] max-w-[763px] rounded-[10px] bg-overlay-panel p-4 text-white focus:outline-none">
        <DialogTitle></DialogTitle>
        <USGMarketListProvider>
          <USGModalMarketList />
        </USGMarketListProvider>
      </DialogContent>
    </Dialog>
  )
}
