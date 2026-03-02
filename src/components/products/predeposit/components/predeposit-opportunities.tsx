"use client"

import { useMemo } from "react"
import { ListState } from "@/types"
import { PredepositContentProps } from "../predeposit.content"
import { AprOpportunity } from "../../usg/earn/components/EarnList"
import { ListHeader } from "@/components/design_system/list/list_header"
import { opportunities } from "../../../../app/(products)/(usg)/earn/aprOpportunities.json"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { aprOpportunitiesListHeaders, mapAPROpportunities } from "../../usg/earn/usg_earn_controller"
import { AprOpportunityItem } from "../../usg/usg_type"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "asset",

    direction: "asc",
  },
}

export const PredepositOpportunities = ({ opportunitiesData }: PredepositContentProps) => {
  const displayRows = useMemo(() => {
    if (!opportunitiesData) return []

    const mappedTasks = mapAPROpportunities(opportunities, opportunitiesData)

    return mappedTasks
  }, [opportunitiesData])

  return (
    <>
      <section className="mt-4 flex w-full flex-col items-start justify-start lg:mt-12">
        <div className="text-2xl font-semibold text-white lg:text-4xl">Opportunities</div>
        <div className="text-sm text-subtitle">View all available rewards opportunities.</div>
      </section>

      <ListProvider _headers={aprOpportunitiesListHeaders} _rows={displayRows!} _listState={listeState}>
        <PredepositOpportunitiesListInner displayRows={displayRows} />
      </ListProvider>
    </>
  )
}

type PredepositOpportunitiesListInnerProps = {
  displayRows: Array<AprOpportunityItem>
}

export function PredepositOpportunitiesListInner({ displayRows }: PredepositOpportunitiesListInnerProps) {
  const { headers, listState, udpateSort } = useListContext()

  return (
    <>
      <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      {displayRows?.map((item, index) => (
        <AprOpportunity key={index} item={item} index={index}></AprOpportunity>
      ))}
    </>
  )
}
