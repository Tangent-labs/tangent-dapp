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
  openInNewTab?: boolean
}

export const AprOpportunityRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex w-full flex-col items-center justify-between xl:flex-row">
      <div className="flex w-full items-center justify-between xl:w-1/3 xl:justify-start">{children?.at(0)}</div>
      <hr className="my-2 w-full opacity-20 xl:hidden" />

      <div className="flex w-full flex-col gap-2 xl:w-2/3 xl:flex-row">
        {children?.at(1)}
        {children?.at(2)}
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

          <div className="flex min-h-6 items-center justify-center gap-2 xl:min-h-11 xl:flex-col xl:items-start xl:gap-0">
            <span className="text-sm font-semibold md:text-xl">{item?.asset?.replaceAll("-", "/")}</span>
            <span className="text-xs text-subtitle">{item?.subLabel}</span>
          </div>
        </div>

        <div className="flex w-full flex-col xl:flex-row">
          <div className="flex w-full items-center justify-between py-1 xl:w-1/3 xl:justify-center">
            <span className="flex text-sm text-subtitle xl:hidden">Protocol</span>
            <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-2 text-xs lg:text-sm">
              {protocolConfig[item.protocolName as ProtocolName] && (
                <>
                  <TokenImage token={protocolConfig[item.protocolName as ProtocolName]} size={16} />
                  <span>{item.protocolName}</span>
                </>
              )}
            </div>
          </div>
          <>
            <div className="flex w-full items-center justify-between py-1 xl:mt-0 xl:w-1/3 xl:justify-center">
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

            <div className="flex w-full items-center justify-between py-1 xl:mt-0 xl:w-1/3 xl:justify-center">
              <div className="flex text-sm text-subtitle xl:hidden"> Pts/Day/$ </div>
              <div className="pr-2 text-sm xl:text-[15px]"> {item?.points} </div>
            </div>
          </>
        </div>
      </ListRow>
    </>
  )
}
