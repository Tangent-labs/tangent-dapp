"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useUSGContext } from "../usg_context"
import { ExistingAsset, ListState } from "@/types"
import { useUSGEarnContext } from "./usg_earn_context"
import { USGEarnListHeaders } from "./usg_earn_controller"
import ListRow from "@/components/design_system/list/list_row"
import { formatBigInt, formatNumber } from "@/lib/number_formatter"
import ListHeader from "@/components/design_system/list/list_header"
import InputSearch from "@/components/design_system/inputs/input_search"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import PointsCampaignLiveCard from "@/components/design_system/structure/points_campaign_live_card"
import { ThreeCardRowWithMask } from "@/components/design_system/structure/three_cards_with_background_and_neon"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "assets",
    direction: "asc",
  },
}

export const USGEarnContent = () => {
  const { searchValue, setSearchValue, displayRows, USGsUSGMetrics } = useUSGEarnContext()

  const { lpUserPoints, voteUserPoints } = useUSGContext()

  return (
    <>
      <div className="flex items-stretch justify-between gap-6">
        <ReliefCard className="hidden w-1/2 bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={150} width={150} src="/medias/tokens/USG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Earn</span>
            <p className="text-[15px]">
              Use USG and sUSG in DeFi protocols to earn yield. Below is the list of known integrations accross DEXs, yield boosters, lending markets, and yield
              trading markets.
            </p>
          </div>
        </ReliefCard>

        <div className="flex h-auto w-full flex-col justify-between gap-2 xl:w-1/2">
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

      <div className="mb-2 mt-6 flex w-full items-end justify-between">
        <div className="flex w-full items-end justify-start gap-2">
          <div className="flex w-full max-w-80 flex-col items-center justify-center">
            <div className="mb-1 text-xs text-subtitle"> Search </div>
            <InputSearch
              placeholder=""
              className="flex w-full flex-col items-center justify-center"
              value={searchValue ?? ""}
              onChange={(e) => setSearchValue(e as string)}
            />
          </div>
        </div>
      </div>

      <ListProvider _headers={USGEarnListHeaders} _rows={displayRows!} _listState={listeState}>
        <USGEarnListInner />
      </ListProvider>
    </>
  )
}

export function USGEarnListInner() {
  const { headers, listState, udpateSort } = useListContext()

  const { displayRows, isLoading } = useUSGEarnContext()

  return (
    <>
      <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      {displayRows?.map((item, index) => (
        <ListRow route={item.link} className={cn(isLoading ? "shimmer" : "")} key={index}>
          <div className="relative flex items-center gap-4">
            <TokenImage token={item?.asset as ExistingAsset} size={48} className="w-12 lg:w-16" />

            <div className="flex flex-col leading-8">
              <span className="text-sm font-semibold md:text-xl">{item?.asset}</span>
              <BorderPanel className="flex items-center justify-center gap-2 !rounded-full bg-earn-action px-4 py-0.5 text-xs">
                <span>{item?.actionLabel}</span>
              </BorderPanel>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-full bg-overlay-panel px-3 py-2">
            {item.protocolName === "Curve" && (
              <div className="flex items-center justify-center gap-2 px-2 py-0.5 text-xs lg:px-3 lg:text-sm">
                <TokenImage token={"CRV"} size={16} />
                <span>Curve</span>
              </div>
            )}
            {item.protocolName === "Convex" && (
              <div className="flex items-center justify-center gap-2 px-2 py-0.5 text-xs lg:px-3 lg:text-sm">
                <TokenImage token={"CVX"} size={16} />
                <span>Convex</span>
              </div>
            )}
            {item.protocolName === "Stake DAO" && (
              <div className="flex items-center justify-center gap-2 px-2 py-0.5 text-xs lg:px-3 lg:text-sm">
                <TokenImage token={"SDT"} size={16} />
                <span>Stake DAO</span>
              </div>
            )}
          </div>

          <div className="flex w-full items-center gap-2">
            <div className="flex w-1/2 items-center justify-center gap-2">
              <div className="flex flex-row items-center justify-center gap-2 text-center md:flex-col md:gap-0">
                <span className="flex items-center justify-center bg-button-active bg-clip-text text-sm font-semibold leading-4 text-transparent md:text-xl">
                  {item?.currentAPR.toFixed(2)}%
                </span>
                <span className="whitespace-nowrap text-xs text-subtitle">
                  {!!item?.projectedAPR && item?.projectedAPR !== 0 ? <>Proj: {item?.projectedAPR.toFixed(2)}%</> : <>Proj: 0%</>}
                </span>

                <span className="hidden text-xs md:flex">Up to {(item?.projectedAPR * 10).toFixed(2)}% at 10x</span>
              </div>
            </div>

            <div className="flex w-1/2 items-center justify-center text-xl">
              <div className="hidden xl:flex"> {item?.points} </div>

              <div className="flex text-xs md:text-sm xl:hidden"> {item?.points} Pts/Day/$ </div>
            </div>
          </div>
        </ListRow>
      ))}
    </>
  )
}
