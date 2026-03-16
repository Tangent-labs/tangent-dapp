"use client"
import { cn } from "@/lib/utils"
import { AprOpportunityItem } from "../../usg_type"
import { ListRow } from "@/components/design_system/list/list_row"
import { protocolConfig, ProtocolName } from "../usg_earn_controller"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { CustomAssetDisplay } from "@/components/design_system/list/custom_asset_display"
import { MarketAPR } from "@/components/design_system/list/market_apr"

type AprOpportunityProps = {
  item: AprOpportunityItem
  index: number
  isLoading?: boolean
}

export const AprOpportunity = ({ item, index, isLoading }: AprOpportunityProps) => {
  return (
    <ListRow route={item.link} className={cn(isLoading ? "shimmer" : "")} key={index}>
      <div className="relative flex items-center gap-2">
        <CustomAssetDisplay token={item?.asset} />

        <div className="flex min-h-11 flex-col items-center justify-center md:flex-col md:items-start">
          <span className="text-sm font-semibold md:text-xl">{item?.asset?.replaceAll("-", "/")}</span>
          <span className="text-xs text-subtitle">{item?.subLabel}</span>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-2 py-1 text-xs lg:text-sm">
          {protocolConfig[item.protocolName as ProtocolName] && (
            <>
              <TokenImage token={protocolConfig[item.protocolName as ProtocolName]} size={16} />
              <span>{item.protocolName}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex w-full items-center gap-2">
        <div className="flex w-1/2 items-center justify-center gap-2">
          <MarketAPR
            marketType={item?.marketType}
            poolName={item?.asset}
            logoKey={item.asset}
            rewardToken={item?.rewardToken}
            maxLeverage={1}
            currentAPRDetails={item.currentAPRDetails}
            projectedAPRDetails={item.projectedAPRDetails}
            apr={item?.currentAPR}
            projectedApr={item?.projectedAPR}
            isMarketListDisplay={true}
          />
        </div>

        <div className="flex w-1/2 items-center justify-center text-xl">
          <div className="hidden xl:flex"> {item?.points} </div>

          <div className="flex text-xs md:text-sm xl:hidden"> {item?.points} Pts/Day/$ </div>
        </div>
      </div>
    </ListRow>
  )
}
