"use client"

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useUSGContext } from "../usg_context"
import { ExistingAsset, ListState } from "@/types"
import { useUSGEarnContext } from "./usg_earn_context"
import { USGEarnListHeaders } from "./usg_earn_controller"
import { ListRow } from "@/components/design_system/list/list_row"
import { formatBigInt, formatNumber } from "@/lib/number_formatter"
import { ListHeader } from "@/components/design_system/list/list_header"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { MarketListAPR } from "@/components/design_system/list/market_list_apr"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"
import { ThreeCardRowWithMask } from "@/components/design_system/structure/three_cards_with_background_and_neon"
import { CustomAssetDisplay } from "@/components/design_system/list/custom_asset_display"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "assets",
    direction: "asc",
  },
}

export const USGEarnContent = () => {
  const { displayRows, USGsUSGMetrics } = useUSGEarnContext()

  const { lpUserPoints, voteUserPoints } = useUSGContext()

  return (
    <>
      <div className="mb-4 flex items-stretch justify-between gap-6">
        <ReliefCard className="hidden w-1/2 bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={165} width={165} src="/medias/logos/earn.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px", paddingLeft: "16px" }} />
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

      <ListProvider _headers={USGEarnListHeaders} _rows={displayRows!} _listState={listeState}>
        <USGEarnListInner />
      </ListProvider>
    </>
  )
}

export function USGEarnListInner() {
  const { headers } = useListContext()

  const { displayRows, isLoading } = useUSGEarnContext()

  return (
    <>
      <ListHeader headers={headers} />

      {displayRows?.map((item, index) => (
        <ListRow route={item.link} className={cn(isLoading ? "shimmer" : "")} key={index}>
          <div className="relative flex items-center gap-2">
            <CustomAssetDisplay token={item?.asset as ExistingAsset} />

            <div className="flex flex-col items-start justify-start">
              <span className="text-sm font-semibold md:text-xl">{item?.asset}</span>

              <Link
                className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-2 py-1 text-sm"
                href={item?.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Zap
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-2 py-1 text-xs lg:text-sm">
              {item.protocolName === "Curve" && (
                <>
                  <TokenImage token={"CRV"} size={16} />
                  <span>Curve</span>
                </>
              )}
              {item.protocolName === "Convex" && (
                <>
                  <TokenImage token={"CVX"} size={16} />
                  <span>Convex</span>
                </>
              )}
              {item.protocolName === "Stake DAO" && (
                <>
                  <TokenImage token={"SDT"} size={16} />
                  <span>Stake DAO</span>
                </>
              )}

              {item.protocolName === "Pendle" && (
                <>
                  <TokenImage token={"PENDLE"} size={16} />
                  Pendle
                </>
              )}
            </div>
          </div>

          <div className="flex w-full items-center gap-2">
            <div className="flex w-1/2 items-center justify-center gap-2">
              <MarketListAPR
                rewardToken={item?.rewardToken}
                maxLeverage={1}
                currentAPRDetails={item.currentAPRDetails}
                projectedAPRDetails={item.projectedAPRDetails}
                apr={item?.currentAPR}
                projectedApr={item?.projectedAPR}
              />
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
