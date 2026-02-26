"use client"

import { useMemo } from "react"
import { Address } from "viem"
import { IconArrow } from "@/components/icons"
import { formatDollar } from "@/lib/number_formatter"
import { PredepositContentProps } from "../predeposit.content"
import { ListRow } from "@/components/design_system/list/list_row"
import { ExistingAsset, ListHeaderData, ListState } from "@/types"
import { EarnProtocolInput, EarnPoolsData } from "../../usg/usg_type"
import { ListHeader } from "@/components/design_system/list/list_header"
import mockJson from "../../../../app/(products)/(usg)/earn/earnMock.json"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { MarketListAPR } from "@/components/design_system/list/market_list_apr"
import { CustomAssetDisplay } from "@/components/design_system/list/custom_asset_display"
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
  const mapOpportunities = (tasks: EarnProtocolInput[], poolsData?: Array<EarnPoolsData>) => {
    return tasks.map((t) => {
      const currentPool = poolsData?.find((el) => el.address === t.address && el.protocol === t.protocolName) || null

      if (currentPool?.protocol === "Pendle") {
        const currentAPR = currentPool?.pendleBaseAPY
        const projectedAPR = currentPool?.pendleBaseAPY
        const rewardToken = "USDe"

        const currentAPRDetails = { APY: currentPool?.pendleBaseAPY }
        const projectedAPRDetails = { APY: currentPool?.pendleBaseAPY }

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
          rewardToken,
          currentAPRDetails,
          projectedAPRDetails,
        }
      } else {
        const currentAPR = currentPool?.gaugeCrvApy?.reduce((sum, n) => sum + n, 0) || 0
        const projectedAPR = currentPool?.gaugeFutureCrvApy?.reduce((sum, n) => sum + n, 0) || 0

        // TODO : set rewardToken dynamically
        const rewardToken = "CRV"

        // TODO : fields to be set dynamically
        const currentAPRDetails = { APY: currentPool?.gaugeCrvApy?.[0], CRV: currentPool?.gaugeCrvApy?.[1] }
        const projectedAPRDetails = { APY: currentPool?.gaugeFutureCrvApy?.[0], CRV: currentPool?.gaugeFutureCrvApy?.[1] }

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
          rewardToken,
          currentAPRDetails,
          projectedAPRDetails,
        }
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
    currentAPR?: number
    projectedAPR?: number
    tvl?: number

    rewardToken: string
    currentAPRDetails?: {
      APY?: number
      CRV?: number
    }
    projectedAPRDetails?: {
      APY?: number
      CRV?: number
    }
    //
    gaugeCrvApy?: Array<number>
    gaugeFutureCrvApy?: Array<number>
    lpTokenAddress?: Address
    convexPoolData?: { usdTotal?: number }
    usdTotal?: number
    pendleBaseAPY?: number
    details?: {
      impliedApy: number
      aggregatedApy: number
    }
  }>
}

export function PredepositOpportunitiesListInner({ displayRows }: PredepositOpportunitiesListInnerProps) {
  const { headers, listState, udpateSort } = useListContext()

  return (
    <>
      <ListHeader headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      {displayRows?.map((item, index) => (
        <ListRow route={item.link} key={index}>
          <div className="relative flex w-full items-center gap-2">
            <CustomAssetDisplay token={item?.asset as ExistingAsset} />

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
            <MarketListAPR
              rewardToken={item?.rewardToken}
              maxLeverage={1}
              currentAPRDetails={item.currentAPRDetails}
              projectedAPRDetails={item.projectedAPRDetails}
              apr={item?.currentAPR}
              projectedApr={item?.projectedAPR}
            />
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
