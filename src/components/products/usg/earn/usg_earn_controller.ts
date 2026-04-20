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
  const sanitizeValue = (value?: number | null) => (typeof value === "number" && Number.isFinite(value) ? value : 0)
  const getAPYValue = (values?: Array<number | null>) => sanitizeValue(values?.[0])
  const getGaugeValue = (values?: Array<number | null>) => sanitizeValue(values?.[1])
  const sumAPRValues = (values?: Array<number | null>) => values?.reduce<number>((sum, value) => sum + sanitizeValue(value), 0) || 0

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
      const isCurveUnstaked = t?.protocolName === "Curve" && t?.subLabel === "(unstaked)"
      const isCurveStaked = t?.protocolName === "Curve" && t?.subLabel === "(staked)"

      const currentAPR = isCurveUnstaked
        ? getAPYValue(currentPool?.gaugeCrvApy)
        : isCurveStaked
          ? getGaugeValue(currentPool?.gaugeCrvApy)
          : sumAPRValues(currentPool?.gaugeCrvApy)

      const projectedAPR = isCurveUnstaked
        ? getAPYValue(currentPool?.gaugeFutureCrvApy)
        : isCurveStaked
          ? getGaugeValue(currentPool?.gaugeFutureCrvApy)
          : sumAPRValues(currentPool?.gaugeFutureCrvApy)

      const rewardToken = "CRV"

      const currentAPRDetails = isCurveUnstaked
        ? { APY: getAPYValue(currentPool?.gaugeCrvApy) }
        : isCurveStaked
          ? { CRV: getGaugeValue(currentPool?.gaugeCrvApy) }
          : { APY: getAPYValue(currentPool?.gaugeCrvApy), CRV: getGaugeValue(currentPool?.gaugeCrvApy) }

      const projectedAPRDetails = isCurveUnstaked
        ? { APY: getAPYValue(currentPool?.gaugeFutureCrvApy) }
        : isCurveStaked
          ? { CRV: getGaugeValue(currentPool?.gaugeFutureCrvApy) }
          : { APY: getAPYValue(currentPool?.gaugeFutureCrvApy), CRV: getGaugeValue(currentPool?.gaugeFutureCrvApy) }

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
