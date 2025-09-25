"use client"

import { ListState } from "@/types"
import { Switch } from "@/components/ui/switch"
import { useUSGHarvestContext } from "./tg_usd_harvest_context"
import { harvestListHeaders } from "./tg_usd_harvest_controller"
import { Button } from "@/components/design_system/inputs/button"
import ListAsset from "@/components/design_system/list/list_asset"
import Divider from "@/components/design_system/structure/divider"
import ListHeader from "@/components/design_system/list/list_header"
import { formatDollar, formatPercent } from "@/lib/number_formatter"
import { HarvestableMarket, HarvesterInfoDisplay } from "../tg_usd_type"
import TokenImage from "@/components/design_system/structure/token_image"
import USGHoverCard from "@/components/design_system/structure/usg_hover_card"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "market",
    direction: "asc",
  },
}

const HarvestRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="flex w-full items-center justify-evenly xl:w-1/2 xl:justify-start">
        <div className="xl:w-1/2">{children?.at(0)}</div>
        <div className="flex justify-center xl:w-1/2">{children?.at(1)}</div>
      </div>
      <hr className="my-2 w-full opacity-20 xl:hidden" />
      <div className="flex w-full flex-wrap items-center justify-between gap-2 xl:w-1/2">{children?.at(2)}</div>
    </div>
  )
}

export default function USGHarvestContent() {
  const { displayRows, onClickHarvest, marketsToHarvest, customSort, onClickHarvestAll } = useUSGHarvestContext()

  return (
    <div className="mt-6 flex w-full flex-col items-start justify-start gap-4 md:flex-row">
      <div className="flex w-full flex-col md:w-9/12">
        <div className="flex w-full items-center justify-end">
          <div className="flex gap-2">
            <span className="text-sm text-subtitle">Harvest all</span>
            <Switch onClick={() => onClickHarvestAll()}></Switch>
          </div>
        </div>

        <ListProvider customSort={customSort} _headers={harvestListHeaders} _rows={displayRows} _listState={listeState}>
          <HarvestList></HarvestList>
        </ListProvider>
      </div>

      <div className="flex h-full min-h-52 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-5 backdrop-blur-[60px] md:w-3/12">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col items-start justify-start">Market</div>

          <div className="flex flex-col items-start justify-start">Harvestable</div>
        </div>

        <Divider className="h-0.5 w-full bg-white/10" />

        <div className="flex w-full flex-col">
          {marketsToHarvest.map((el: HarvestableMarket) => (
            <div key={el.marketName} className="my-1 flex w-full items-center justify-between">
              <div className={`relative flex items-center gap-4`}>
                <TokenImage token={el.marketName} size={16} className="w-8" />
                <span className="text-[12px] font-semibold">{el.marketName}</span>
              </div>

              <span className="text-[12px] font-semibold">${el.harvestable}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex w-full">
          {marketsToHarvest.length > 0 && <Button label="Harvest" className="flex w-full items-center justify-center" onClick={() => onClickHarvest()} />}
        </div>
      </div>
    </div>
  )
}

function HarvestList() {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  const { addToHarvestableMarkets, marketsToHarvest } = useUSGHarvestContext()

  return (
    <>
      <div className="my-2 w-full rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ListHeader rowDisposition={HarvestRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      {(displayRows as HarvesterInfoDisplay[])?.map((item: HarvesterInfoDisplay) => (
        <div key={item.contractAddress} className="my-1 rounded-[10px] bg-overlay-panel px-4 py-2.5 backdrop-blur-[60px]">
          <div className="flex items-center justify-between max-xl:flex-col">
            <div className="flex w-full items-center justify-evenly xl:w-1/2 xl:justify-start">
              <div className="xl:w-1/2">
                <ListAsset name={item?.asset} token={item.asset} assetsEarned={[]} />
              </div>
              <div className="flex justify-center gap-2 text-xl xl:w-1/2">
                {formatDollar(item?.rewards?.totalDollar || 0)}

                <USGHoverCard iconClassName="text-row-tonic" title={`${item?.asset} Rewards Breakdown`}>
                  <div className="flex flex-col gap-1 text-sm">
                    {item?.rewards?.details?.map((reward, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-10">
                          <TokenImage token={reward.logo} size={16} />
                        </div>
                        <span className="w-20"> {reward.logo}</span>
                        <span className=""> {formatDollar(reward.dollarValue)}</span>
                      </div>
                    ))}
                  </div>
                </USGHoverCard>
              </div>
            </div>
            <hr className="my-2 w-full opacity-20 xl:hidden" />
            <div className="flex w-full flex-wrap items-center justify-between gap-2 xl:w-1/2">
              <div className="flex w-full flex-1 cursor-pointer items-center justify-center gap-2 text-xl">{formatPercent(item?.harvesterFees)}</div>

              <div className="flex w-full flex-1 cursor-pointer items-center justify-center text-xl">{formatDollar(item?.rewards.totalDollar)}</div>

              <div className="flex w-full flex-1 cursor-pointer flex-col items-center justify-center">
                <Switch
                  checked={!!marketsToHarvest.find((market) => market.marketName === item.asset)}
                  onCheckedChange={() =>
                    addToHarvestableMarkets({
                      marketName: item.asset,
                      harvestable: item.rewards.totalDollar,
                      marketAddress: item.asset,
                    })
                  }
                />
                <span className="mt-1 text-xs"> Last Harvest {item.lastHarvestDate} </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
