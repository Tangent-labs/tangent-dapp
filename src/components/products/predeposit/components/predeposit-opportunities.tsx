"use client"

import { useMemo } from "react"
import { ListState } from "@/types"
import { AprOpportunityItem } from "../../usg/usg_type"
import { AprOpportunity, AprOpportunityRowDisposition } from "../../usg/earn/components/EarnList"
import { ListHeader } from "@/components/design_system/list/list_header"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { aprOpportunitiesListHeaders, mapAPROpportunities } from "../../usg/earn/usg_earn_controller"
import { EarnPoolsData } from "../../usg/client_api_external"
import { opportunities } from "@/app/(products)/(usg)/earn/aprOpportunities"

const listState: ListState = {
  search: undefined,
  sort: {
    key: "asset",
    direction: "asc",
  },
}

type PredepositOpportunities = {
  opportunitiesData: EarnPoolsData[]
}

export const PredepositOpportunities = ({ opportunitiesData }: PredepositOpportunities) => {
  const displayRows = useMemo(() => {
    if (!opportunitiesData) return []

    const mappedTasks = mapAPROpportunities(opportunities, opportunitiesData)

    return mappedTasks
  }, [opportunitiesData])

  const sortAprOpportunities = (l: ListState) => {
    const { key, direction } = l.sort!

    displayRows.sort((elementA: AprOpportunityItem, elementB: AprOpportunityItem) => {
      const aValue = elementA[key as keyof AprOpportunityItem] ?? 0
      const bValue = elementB[key as keyof AprOpportunityItem] ?? 0

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  return (
    <>
      <section className="mb-2 mt-4 flex w-full flex-col items-start justify-start lg:mt-12">
        <div className="text-2xl font-semibold text-white lg:text-4xl">Opportunities</div>
        <div className="text-sm text-subtitle">View all available rewards opportunities.</div>
      </section>

      <ListProvider _headers={aprOpportunitiesListHeaders} _rows={displayRows!} customSort={sortAprOpportunities} _listState={listState}>
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
      <ListHeader rowDisposition={AprOpportunityRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      {displayRows?.map((item, index) => (
        <AprOpportunity key={index} item={item} index={index} openInNewTab={true} />
      ))}
    </>
  )
}
