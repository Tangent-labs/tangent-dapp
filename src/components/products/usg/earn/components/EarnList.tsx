"use client"
import React from "react"
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
  openInNewTab?: boolean
}

export const AprOpportunityRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  const flat = React.Children.toArray(children)
  return (
    <div className="flex w-full flex-col xl:flex-row xl:items-center">
      <div className="flex w-full items-center justify-between xl:w-1/3 xl:justify-start">
        <div> {flat.at(0)}</div>
        <div className="flex justify-self-end xl:hidden">{flat.at(1)}</div>
      </div>
      <div className="flex justify-between xl:w-2/3">
        <div className="hidden flex-1 items-center xl:flex">{flat.at(1)}</div>
        <div className="flex flex-1 items-center">{flat.at(2)}</div>
        <div className="flex flex-1 items-center">{flat.at(3)}</div>
      </div>
    </div>
  )
}

export const AprOpportunity = ({ item, index, isLoading, openInNewTab = false }: AprOpportunityProps) => {
  return (
    <>
      <ListRow
        rowDisposition={AprOpportunityRowDisposition}
        route={item.link}
        openInNewTab={openInNewTab}
        className={cn(isLoading ? "shimmer" : "")}
        key={index}
      >
        <div className="relative flex items-center gap-2">
          <CustomAssetDisplay token={item?.asset} />

          <div className="flex min-h-11 flex-col items-center justify-center md:flex-col md:items-start">
            <span className="text-sm font-semibold md:text-xl">{item?.asset?.replaceAll("-", "/")}</span>
            <span className="text-xs text-subtitle">{item?.subLabel}</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-2 py-1 text-xs lg:text-sm">
            {protocolConfig[item.protocolName as ProtocolName] && (
              <>
                <TokenImage token={protocolConfig[item.protocolName as ProtocolName]} size={16} />
                <span>{item.protocolName}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-1 items-center">
          <MarketAPR
            marketType={item?.marketType}
            poolName={item?.asset?.replaceAll("-", "/")}
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

        <div className="flex flex-1 items-center justify-end xl:justify-center">
          <div className="hidden text-[15px] xl:flex">{item?.points}</div>
          <div className="flex text-xs md:text-sm xl:hidden">{item?.points} Pts/Day/$</div>
        </div>
      </ListRow>
    </>
  )
}
