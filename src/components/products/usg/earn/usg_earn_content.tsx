"use client"

import Image from "next/image"
import { ListState } from "@/types"
import { useUSGContext } from "../usg_context"
import { useUSGEarnContext } from "./usg_earn_context"
import { AprOpportunity, AprOpportunityRowDisposition } from "./components/EarnList"
import { aprOpportunitiesListHeaders } from "./usg_earn_controller"
import { InputSearch } from "@/components/design_system/inputs/input_search"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { protocolOptions } from "../list/usg_market_controller"
import { ListHeader } from "@/components/design_system/list/list_header"
import { PageHeader } from "@/components/design_system/structure/page_header"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"
import { UsgBalanceAndTotalPoints } from "@/components/design_system/structure/balance_and_total_points"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "assets",
    direction: "asc",
  },
}

export const USGEarnContent = () => {
  const { displayRows, USGsUSGMetrics, sortAprOpportunities } = useUSGEarnContext()

  const { lpUserPoints, voteUserPoints } = useUSGContext()

  return (
    <>
      <div className="mb-[10px] flex items-stretch justify-between gap-6">
        <PageHeader>
          <Image height={165} width={165} src="/medias/logos/earn.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px", paddingLeft: "16px" }} />

          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Earn</span>
            <p className="text-[15px]">
              Use USG and sUSG in DeFi protocols to earn yield. Below is the list of known integrations accross DEXs, yield boosters, lending markets, and yield
              trading markets.
            </p>
          </div>
        </PageHeader>

        <div className="flex h-auto w-full flex-col justify-between gap-[10px] xl:w-1/2">
          <PointsCampaignLiveCard />

          <UsgBalanceAndTotalPoints USGsUSGMetrics={USGsUSGMetrics} lpUserPoints={lpUserPoints} voteUserPoints={voteUserPoints} />
        </div>
      </div>

      <ListProvider _headers={aprOpportunitiesListHeaders} _rows={displayRows!} customSort={sortAprOpportunities} _listState={listeState}>
        <USGEarnListInner />
      </ListProvider>
    </>
  )
}

export function USGEarnListInner() {
  const { headers, udpateSort } = useListContext()

  const { displayRows, isLoading, searchValue, setSearchValue, protocolFilter, setProtocolFilter } = useUSGEarnContext()

  return (
    <>
      <div className="mb-[10px] mt-4 hidden items-end justify-between xl:flex">
        <div className="flex w-full min-w-96 flex-col items-center justify-center md:w-fit">
          <div className="mb-1 text-xs text-subtitle"> Search </div>
          <InputSearch
            placeholder=""
            className="flex w-full flex-col items-center justify-center"
            value={searchValue}
            onChange={(e) => setSearchValue(e as string)}
          />
        </div>
        <div className="flex flex-col items-center justify-center md:w-fit">
          <div className="mb-1 text-xs text-subtitle"> Protocol </div>
          <InputSelect className="w-full min-w-48" value={protocolFilter} options={protocolOptions} onChange={(e) => setProtocolFilter(e)} />
        </div>
      </div>
      <ListHeader rowDisposition={AprOpportunityRowDisposition} headers={headers} onSort={udpateSort} />
      {displayRows?.map((item, index) => <AprOpportunity item={item} key={index} index={index} isLoading={isLoading}></AprOpportunity>)}
    </>
  )
}
