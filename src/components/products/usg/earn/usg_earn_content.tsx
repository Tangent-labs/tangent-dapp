"use client"

import Image from "next/image"
import { ListState } from "@/types"
import { useUSGContext } from "../usg_context"
import { useUSGEarnContext } from "./usg_earn_context"
import { AprOpportunity } from "./components/EarnList"
import { aprOpportunitiesListHeaders } from "./usg_earn_controller"
import { formatBigInt, formatNumber } from "@/lib/number_formatter"
import { ListHeader } from "@/components/design_system/list/list_header"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"
import { ThreeCardRowWithMask } from "@/components/design_system/structure/three_cards_with_background_and_neon"

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

      <ListProvider _headers={aprOpportunitiesListHeaders} _rows={displayRows!} _listState={listeState}>
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
        <AprOpportunity item={item} key={item?.asset} index={index} isLoading={isLoading}></AprOpportunity>
      ))}
    </>
  )
}
