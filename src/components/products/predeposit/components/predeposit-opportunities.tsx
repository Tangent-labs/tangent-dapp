"use client"

import { useMemo } from "react"
import { IconArrow } from "@/components/icons"
import { formatDollar } from "@/lib/number_formatter"
import { PredepositContentProps } from "../predeposit.content"
import { ListRow } from "@/components/design_system/list/list_row"
import { EarnProtocolInput, GaugeAPR } from "../../usg/usg_type"
import { ExistingAsset, ListHeaderData, ListState } from "@/types"
import { ListHeader } from "@/components/design_system/list/list_header"
import { TokenImage } from "@/components/design_system/structure/token_image"
import mockJson from "../../../../app/(products)/(usg)/earn/earnMock.json"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"

export const predepositOpportunitiesListHeaders: ListHeaderData[] = [
  { label: "Asset", key: "asset" },
  { label: "APR", key: "apr" },
  { label: "TVL", key: "tvl" },
  { label: "Pts/Day/$", key: "points" },
]

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "asset",
    direction: "asc",
  },
}

export const PredepositOpportunities = ({ opportunitiesData }: PredepositContentProps) => {
  const mapOpportunities = (tasks: EarnProtocolInput[], poolsData?: Array<GaugeAPR>) => {
    return tasks.map((t) => {
      const currentPool = poolsData?.find((el) => el.address === t.address && el.protocol === t.protocolName) || null

      const currentAPR = currentPool?.gaugeCrvApy.reduce((sum, n) => sum + n, 0) || 0
      const projectedAPR = currentPool?.gaugeFutureCrvApy.reduce((sum, n) => sum + n, 0) || 0

      return {
        name: t.name,
        asset: t.asset,
        link: t.link,
        protocolName: t.protocolName,
        actionLabel: t.actionLabel,
        points: t.points,
        address: t.address,
        currentAPR,
        projectedAPR,
        tvl: currentPool?.usdTotal,
      }
    })
  }

  const displayRows = useMemo(() => {
    if (!opportunitiesData) return []

    const mappedTasks = mapOpportunities(mockJson?.tasks, opportunitiesData)

    return mappedTasks
  }, [opportunitiesData])

  return (
    <>
      <section className="mt-4 flex w-full flex-col items-start justify-start lg:mt-12">
        <div className="text-2xl font-semibold text-white lg:text-4xl">Opportunities</div>
        <div className="text-sm text-subtitle">View all available rewards opportunities.</div>
      </section>

      <ListProvider _headers={predepositOpportunitiesListHeaders} _rows={displayRows!} _listState={listeState}>
        <PredepositOpportunitiesListInner displayRows={displayRows} />
      </ListProvider>
    </>
  )
}

type PredepositOpportunitiesListInnerProps = {
  displayRows: Array<{
    name: string
    asset: string
    link: string
    protocolName: string
    actionLabel: string
    points: number
    address: string
    currentAPR: number
    projectedAPR: number
    tvl?: number
  }>
}

export function PredepositOpportunitiesListInner({ displayRows }: PredepositOpportunitiesListInnerProps) {
  const { headers, listState, udpateSort } = useListContext()

  return (
    <>
      <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      {displayRows?.map((item, index) => (
        <ListRow route={item.link} key={index}>
          <div className="relative flex w-full items-center gap-4">
            <TokenImage token={item?.asset as ExistingAsset} size={48} className="w-12 lg:w-16" />

            <div className="flex flex-col items-start justify-center">
              <span className="text-sm font-semibold md:text-xl">{item?.asset}</span>

              <div className="flex items-center justify-center rounded-full bg-overlay-panel px-3 py-1">
                {item.protocolName === "Curve" && (
                  <div onClick={() => window.open(item?.link, "_blank")} className="flex items-center justify-center gap-2 text-xs">
                    <TokenImage token={"CRV"} size={12} />
                    <span>Curve</span>
                    <IconArrow className="w-2"></IconArrow>
                  </div>
                )}
                {item.protocolName === "Convex" && (
                  <div onClick={() => window.open(item?.link, "_blank")} className="flex items-center justify-center gap-2 text-xs">
                    <TokenImage token={"CVX"} size={12} />
                    <span>Convex</span>
                    <IconArrow className="w-2"></IconArrow>
                  </div>
                )}
                {item.protocolName === "Stake DAO" && (
                  <div onClick={() => window.open(item?.link, "_blank")} className="flex items-center justify-center gap-2 text-xs">
                    <TokenImage token={"SDT"} size={12} />
                    <span>Stake DAO</span>
                    <IconArrow className="w-2"></IconArrow>
                  </div>
                )}
                {item.protocolName === "Tangent" && (
                  <div onClick={() => window.open(item?.link, "_blank")} className="flex items-center justify-center gap-2 text-xs">
                    <TokenImage token={"USG"} size={12} />
                    <span>Tangent</span>
                    <IconArrow className="w-2"></IconArrow>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-2">
            <div className="flex flex-row items-center justify-center gap-2 text-center md:flex-col md:gap-0">
              <span className="flex items-center justify-center bg-button-active bg-clip-text text-sm font-semibold leading-4 text-transparent md:text-xl">
                {item?.currentAPR.toFixed(2)}%
              </span>
              <span className="whitespace-nowrap text-xs text-subtitle">
                {!!item?.projectedAPR && item?.projectedAPR !== 0 ? <>Proj: {item?.projectedAPR.toFixed(2)}%</> : <>Proj: 0%</>}
              </span>
            </div>
          </div>

          <div className="flex w-full items-center gap-2">
            <div className="flex w-1/2 items-center justify-center gap-2">{formatDollar(item?.tvl?.toFixed(0))}</div>

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
