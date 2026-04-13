"use client"

import Image from "next/image"
import { ListState } from "@/types"
import { useUSGContext } from "../usg_context"
import { Switch } from "@/components/ui/switch"
import { useUSGHarvestContext } from "./usg_harvest_context"
import { harvestListHeaders } from "./usg_harvest_controller"
import { Button } from "@/components/design_system/inputs/button"
import { formatDollar, formatPercent } from "@/lib/number_formatter"
import { Divider } from "@/components/design_system/structure/divider"
import { HarvestableMarket, HarvesterInfoDisplay } from "../usg_type"
import { ListAsset } from "@/components/design_system/list/list_asset"
import { ListHeader } from "@/components/design_system/list/list_header"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { PageHeader } from "@/components/design_system/structure/page_header"
import { USGHoverCard } from "@/components/design_system/structure/usg_hover_card"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { ListGradientBorder } from "@/components/design_system/list/list_gradient_border"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"
import { UsgBalanceAndTotalPoints } from "@/components/design_system/structure/balance_and_total_points"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "totalRewards",
    direction: "desc",
  },
}

const HarvestRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="flex w-full items-center justify-between xl:w-[43.75%] xl:justify-start">
        <div className="xl:w-[57.14%]">{children?.at(0)}</div>
        <div className="flex justify-center xl:w-[42.86%]">{children?.at(1)}</div>
      </div>
      <hr className="my-2 w-full opacity-20 xl:hidden" />
      <div className="flex w-full flex-wrap items-center justify-between gap-2 xl:w-[56.25%] xl:gap-0">{children?.at(2)}</div>
    </div>
  )
}

export default function USGHarvestContent() {
  const { lpUserPoints, voteUserPoints } = useUSGContext()

  const { isConnected, connect } = useWalletConnexionContext()

  const { displayRows, USGsUSGMetrics, marketsToHarvest, isChainviewLoading, isTxLoading, getSortedRows, onClickSelectAll, onClickHarvest } =
    useUSGHarvestContext()

  return (
    <>
      <div className="flex items-stretch justify-between gap-6">
        <PageHeader>
          <Image height={150} width={150} src="/medias/logos/claim.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Harvest</span>
            <p className="text-[15px]">Harvest markets&apos; rewards.</p>
          </div>
        </PageHeader>

        <div className="flex h-auto w-full flex-col justify-between gap-[10px] xl:w-1/2">
          <PointsCampaignLiveCard />

          <UsgBalanceAndTotalPoints USGsUSGMetrics={USGsUSGMetrics} lpUserPoints={lpUserPoints} voteUserPoints={voteUserPoints} />
        </div>
      </div>

      <div className="mt-5 flex w-full flex-col items-start justify-start gap-[10px] md:flex-row">
        <div className="flex w-full flex-col md:w-9/12">
          <ListProvider getSortedRows={getSortedRows} _headers={harvestListHeaders} _rows={displayRows} _listState={listeState}>
            <HarvestList></HarvestList>
          </ListProvider>

          {!isChainviewLoading && displayRows?.length === 0 && (
            <div className="mt-24 flex w-full items-center justify-center text-sm text-subtitle">Nothing to harvest for now</div>
          )}
        </div>

        <div className="flex w-full flex-col items-center justify-center md:w-3/12">
          <div className="relative hidden w-full xl:block">
            <div className="flex w-full justify-between gap-3 rounded-t-[10px] bg-overlay-panel px-4 py-2.5 leading-[10px] backdrop-blur-[60px]">
              <span className="text-sm text-subtitle">Harvest all</span>
              <Switch checked={displayRows?.length > 0 && marketsToHarvest.length === displayRows.length} onClick={() => onClickSelectAll()}></Switch>
            </div>

            <ListGradientBorder classname={"rounded-t-[10px]"} />
          </div>

          <div className="relative mt-1 flex h-full min-h-52 w-full flex-col items-start justify-start p-2 backdrop-blur-[60px] transition-all duration-200 ease-out before:absolute before:inset-0 before:-z-10 before:opacity-60 before:transition-all before:duration-300">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col items-start justify-start">Market</div>

              <div className="flex flex-col items-start justify-start">Harvestable</div>
            </div>

            <Divider />

            <div className="flex w-full flex-col">
              {marketsToHarvest.map((el: HarvestableMarket) => (
                <div key={el.marketAddress} className="my-1 flex w-full items-center justify-between">
                  <div className={`relative flex items-center gap-4`}>
                    <TokenImage token={el.logoKey} size={32} className="w-8" />
                    <span className="text-[12px] font-semibold">{el.marketName}</span>
                  </div>

                  <span className="text-[12px] font-semibold">{formatDollar(el.harvestable, 2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex w-full">
              {marketsToHarvest.length > 0 && isConnected && (
                <Button
                  label="Harvest"
                  className="flex w-full items-center justify-center"
                  hasLoadingState={true}
                  isLoading={isTxLoading}
                  state={isTxLoading ? "disabled" : "active"}
                  onClick={() => onClickHarvest()}
                />
              )}

              {!isConnected && <Button label="Connect wallet" className="flex w-full items-center justify-center" onClick={connect} />}
            </div>
            <ListGradientBorder />
          </div>
        </div>
      </div>
    </>
  )
}
function HarvestList() {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  const { addToHarvestableMarkets, marketsToHarvest } = useUSGHarvestContext()

  return (
    <>
      <div className="mb-0.5 w-full">
        <ListHeader rowDisposition={HarvestRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      {(displayRows as HarvesterInfoDisplay[])?.map((item: HarvesterInfoDisplay) => {
        const isSelected = !!marketsToHarvest.find((market) => market.marketAddress === item.contractAddress)
        const selectedClass = isSelected ? "bg-panel-selected-row" : "bg-overlay-panel"

        return (
          <div
            key={item.contractAddress}
            className={`my-0.5 px-4 py-1 backdrop-blur-[60px] hover-lift-row ${selectedClass}`}
            onClick={() =>
              addToHarvestableMarkets({
                ...item,
                marketName: item.asset,
                harvestable: item.rewards.totalDollar,
                marketAddress: item.contractAddress,
              })
            }
          >
            <div className="flex items-center justify-between max-xl:flex-col">
              <div className="flex w-full items-center justify-between xl:w-[43.75%] xl:justify-start">
                {/* COL "ASSET" */}
                <div className="xl:w-[57.14%]">
                  <ListAsset name={item?.logoKey} token={item?.logoKey} />
                </div>
                {/* COL "TOTAL REWARDS" */}
                <div className="flex justify-center gap-2 text-sm md:text-[15px] xl:w-[42.86%]">
                  {formatDollar(item?.rewards?.totalDollar || 0)}

                  <USGHoverCard iconClassName="w-3" title={`${item?.asset} Rewards Breakdown`}>
                    <div className="flex flex-col gap-1 text-sm">
                      {item?.rewards?.details?.map((reward, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <TokenImage token={reward.logoKey} size={16} />
                          <span className="w-20"> {reward.logoKey}</span>
                          <span> {formatDollar(reward.dollarValue)}</span>
                        </div>
                      ))}
                    </div>
                  </USGHoverCard>
                </div>
              </div>
              <hr className="my-2 w-full opacity-20 xl:hidden" />
              <div className="flex w-full flex-wrap items-center justify-between gap-2 xl:w-[56.25%] xl:gap-0">
                {/* COL "HARVESTER FEES" */}
                <div className="flex w-full flex-1 items-center justify-center gap-2 text-sm md:text-[15px]">{formatPercent(item?.percentage)}</div>

                {/* COL "HARVESTER REWARDS" */}
                <div className="flex w-full flex-1 items-center justify-center text-sm md:text-[15px]">
                  {formatDollar((item?.rewards.totalDollar * item?.percentage) / 100)}
                </div>

                {/* COL "SWITCH LAST & LAST HARVEST" */}
                <div className="flex w-full flex-1 flex-col items-center justify-center">
                  <span className="text-sm">{item.lastHarvestDate} </span>
                </div>
              </div>
            </div>
            <ListGradientBorder />
          </div>
        )
      })}
    </>
  )
}
