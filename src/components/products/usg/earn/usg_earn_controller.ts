"use client"

import { Address } from "viem"
import { ListHeaderData } from "@/types"
import { EarnProtocolInput, USGMarketType } from "../usg_type"
import { EarnPoolsData } from "../client_api_external"

export type APROpportunitiesData = {
  protocol: string
  address: Address
  gaugeCrvApy?: Array<number> | undefined
  gaugeFutureCrvApy?: Array<number> | undefined
  lpTokenAddress?: Address
  convexPoolData?: {
    usdTotal?: number
  }
  usdTotal?: number
  pendleBaseAPY?: number
  details?: {
    impliedApy: number
    aggregatedApy: number
  }
  pt?: string
  yt?: string
}

export const aprOpportunitiesListHeaders: ListHeaderData[] = [
  { label: "Asset", key: "asset" },
  {
    label: "Protocol",
    key: "protocol",
  },
  {
    label: "APR",
    key: "currentAPR",
    sort: "sort",
  },
  { label: "Pts/Day/$", key: "points", sort: "sort" },
]

export const mapAPROpportunities = (tasks: EarnProtocolInput[], poolsData?: Array<EarnPoolsData>) => {
  return tasks.map((t) => {
    const currentPool = poolsData?.find((el) => {
      if (el?.protocol === "Pendle") {
        return (el.address === t.address && el.protocol === t.protocolName) || el?.pt === t.address || el?.yt === t.address
      }

      return (el.address === t.address && el.protocol === t.protocolName) || null
    })

    if (currentPool?.protocol === "Pendle") {
      const currentAPR = currentPool?.pendleBaseAPY
      const projectedAPR = currentPool?.pendleBaseAPY
      const rewardToken = "USDe"

      const currentAPRDetails = { APY: currentPool?.pendleBaseAPY }
      const projectedAPRDetails = { APY: currentPool?.pendleBaseAPY }

      return {
        marketType: t?.marketType as USGMarketType,
        name: t.name,
        asset: t.asset,
        link: t.link,
        subLabel: t?.subLabel || "",
        protocolName: t.protocolName,
        points: t.points,
        address: t.address,
        currentAPR,
        projectedAPR,
        rewardToken,
        currentAPRDetails,
        projectedAPRDetails,
      }
    } else {
      const currentAPR = t?.subLabel === "(unstaked)" ? currentPool?.gaugeCrvApy?.[0] : currentPool?.gaugeCrvApy?.reduce((sum, n) => sum + n, 0) || 0

      const projectedAPR =
        t?.subLabel === "(unstaked)" ? currentPool?.gaugeFutureCrvApy?.[0] : currentPool?.gaugeFutureCrvApy?.reduce((sum, n) => sum + n, 0) || 0

      const rewardToken = "CRV"

      const currentAPRDetails =
        t?.subLabel === "(unstaked)" ? { APY: currentPool?.gaugeCrvApy?.[0] } : { APY: currentPool?.gaugeCrvApy?.[0], CRV: currentPool?.gaugeCrvApy?.[1] }

      const projectedAPRDetails =
        t?.subLabel === "(unstaked)"
          ? { APY: currentPool?.gaugeFutureCrvApy?.[0] }
          : { APY: currentPool?.gaugeFutureCrvApy?.[0], CRV: currentPool?.gaugeFutureCrvApy?.[1] }

      return {
        marketType: t?.marketType as USGMarketType,
        name: t.name,
        asset: t.asset,
        link: t.link,
        subLabel: t?.subLabel || "",
        protocolName: t.protocolName,
        points: t.points,
        address: t.address,
        currentAPR,
        projectedAPR,
        rewardToken,
        currentAPRDetails,
        projectedAPRDetails,
      }
    }
  })
}

export const protocolConfig = {
  Curve: "CRV",
  Convex: "CVX",
  "Stake DAO": "SDT",
  Pendle: "PENDLE",
} as const

export type ProtocolName = keyof typeof protocolConfig
