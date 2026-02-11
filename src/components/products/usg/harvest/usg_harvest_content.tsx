"use client"

import Image from "next/image"
import { useUSGContext } from "../usg_context"
import { Switch } from "@/components/ui/switch"
import { ExistingAsset, ListState } from "@/types"
import { useUSGHarvestContext } from "./usg_harvest_context"
import { harvestListHeaders } from "./usg_harvest_controller"
import { Button } from "@/components/design_system/inputs/button"
import ListAsset from "@/components/design_system/list/list_asset"
import Divider from "@/components/design_system/structure/divider"
import ListHeader from "@/components/design_system/list/list_header"
import { HarvestableMarket, HarvesterInfoDisplay } from "../usg_type"
import TokenImage from "@/components/design_system/structure/token_image"
import USGHoverCard from "@/components/design_system/structure/usg_hover_card"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { formatBigInt, formatDollar, formatNumber, formatPercent } from "@/lib/number_formatter"
import PointsCampaignLiveCard from "@/components/design_system/structure/points_campaign_live_card"
import { ThreeCardRowWithMask } from "@/components/design_system/structure/three_cards_with_background_and_neon"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

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
      <div className="flex w-full items-center justify-between xl:w-1/2 xl:justify-start">
        <div className="xl:w-1/2">{children?.at(0)}</div>
        <div className="flex justify-center xl:w-1/2">{children?.at(1)}</div>
      </div>
      <hr className="my-2 w-full opacity-20 xl:hidden" />
      <div className="flex w-full flex-wrap items-center justify-between gap-2 xl:w-1/2">{children?.at(2)}</div>
    </div>
  )
}

export default function USGHarvestContent() {
  const { lpUserPoints, voteUserPoints } = useUSGContext()

  const { isConnected, connect } = useWalletConnexionContext()

  const { displayRows, USGsUSGMetrics, marketsToHarvest, isLoading, customSort, onClickSelectAll, onClickHarvest } = useUSGHarvestContext()

  return (
    <>
      <div className="flex items-stretch justify-between gap-6">
        <ReliefCard className="hidden w-1/2 rounded-[10px] bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={140} width={140} src="/medias/tokens/USG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Harvest</span>
            <p className="text-[15px]">Harvest protocol-generated CRV, CVX or FXN rewards.</p>
          </div>
        </ReliefCard>

        <div className="flex h-auto w-full flex-col items-center gap-2 xl:w-1/2">
          <PointsCampaignLiveCard></PointsCampaignLiveCard>

          <ThreeCardRowWithMask
            contents={[
              { key: "USG Balance", value: formatBigInt(USGsUSGMetrics?.USGBalance || 0n, 18, 2) },
              { key: "sUSG Balance", value: formatBigInt(USGsUSGMetrics?.sUSGBalance || 0n, 18, 2) },
              { key: "Your Total Points", value: `${formatNumber(lpUserPoints?.lpTotalPoints + voteUserPoints?.voteTotalPoints, 0)} pts` },
            ]}
          ></ThreeCardRowWithMask>
        </div>
      </div>

      <div className="mt-6 flex w-full flex-col items-start justify-start gap-4 md:flex-row">
        <div className="flex w-full flex-col md:w-9/12">
          <div className="flex w-full items-center justify-end">
            <div className="flex gap-2">
              <span className="text-sm text-subtitle">Harvest all</span>
              <Switch onClick={() => onClickSelectAll()}></Switch>
            </div>
          </div>

          <ListProvider customSort={customSort} _headers={harvestListHeaders} _rows={displayRows} _listState={listeState}>
            <HarvestList></HarvestList>
          </ListProvider>

          {!isLoading && displayRows?.length === 0 && (
            <div className="mt-24 flex w-full items-center justify-center text-sm text-subtitle">Nothing to harvest for now</div>
          )}
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
                  {el.marketName?.substring(0, el.marketName.indexOf(" ")) === "USDe" || el.marketName?.substring(0, el.marketName.indexOf(" ")) === "sUSDe" ? (
                    <TokenImage token={el.marketName as ExistingAsset} size={24} className="ml-1 w-6" />
                  ) : (
                    <TokenImage token={el.marketName as ExistingAsset} size={32} className="w-8" />
                  )}

                  <span className="text-[12px] font-semibold">{el.marketName}</span>
                </div>

                <span className="text-[12px] font-semibold">{formatDollar(el.harvestable, 2)}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex w-full">
            {marketsToHarvest.length > 0 && isConnected && (
              <Button label="Harvest" className="flex w-full items-center justify-center" onClick={() => onClickHarvest()} />
            )}

            {!isConnected && <Button label="Connect wallet" className="flex w-full items-center justify-center" onClick={connect} />}
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
      <div className="mb-0.5 mt-2 w-full rounded-t-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ListHeader rowDisposition={HarvestRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      {(displayRows as HarvesterInfoDisplay[])?.map((item: HarvesterInfoDisplay) => (
        <div key={item.contractAddress} className="my-0.5 bg-overlay-panel px-4 py-2.5 backdrop-blur-[60px]">
          <div className="flex items-center justify-between max-xl:flex-col">
            <div className="flex w-full items-center justify-between xl:w-1/2 xl:justify-start">
              <div className="xl:w-1/2">
                <ListAsset name={item?.asset} token={item.asset} assetsEarned={[]} />
              </div>
              <div className="text-md flex justify-center gap-2 md:text-lg xl:w-1/2">
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
              <div className="flex w-full flex-1 cursor-pointer items-center justify-center gap-2 text-sm md:text-lg">{formatPercent(item?.percentage)}</div>

              <div className="flex w-full flex-1 cursor-pointer items-center justify-center text-sm md:text-lg">
                {formatDollar((item?.rewards.totalDollar * item?.percentage) / 100)}
              </div>

              <div className="flex w-full flex-1 cursor-pointer flex-col items-center justify-center">
                <Switch
                  checked={!!marketsToHarvest.find((market) => market.marketName === item.asset)}
                  onCheckedChange={() =>
                    addToHarvestableMarkets({
                      marketName: item.asset,
                      harvestable: item.rewards.totalDollar,
                      marketAddress: item.contractAddress,
                      percentage: item?.percentage,
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
