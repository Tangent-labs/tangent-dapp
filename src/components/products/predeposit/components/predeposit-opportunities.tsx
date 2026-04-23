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
    key: "currentAPR",
    direction: "desc",
  },
}

type PredepositOpportunities = {
  opportunitiesData: EarnPoolsData[]
}

export const PredepositOpportunities = ({ opportunitiesData }: PredepositOpportunities) => {
  const displayRows = useMemo(() => {
    if (!opportunitiesData) return []

    return mapAPROpportunities(opportunities, opportunitiesData)
  }, [opportunitiesData])

  const getSortedRows = (rows: AprOpportunityItem[], l: ListState) => {
    const { key, direction } = l.sort!

    return [...rows].sort((elementA, elementB) => {
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

      <ListProvider _headers={aprOpportunitiesListHeaders} _rows={displayRows} getSortedRows={getSortedRows} _listState={listState}>
        <PredepositOpportunitiesListInner />
      </ListProvider>
    </>
  )
}

export function PredepositOpportunitiesListInner() {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  return (
    <>
      <ListHeader rowDisposition={AprOpportunityRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      {(displayRows as AprOpportunityItem[]).map((item, index) => (
        <AprOpportunity key={index} item={item} index={index} openInNewTab={true} />
      ))}
    </>
  )
}
