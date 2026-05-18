"use client"

import { Address, Hex, Abi } from "viem"
import { ListHeaderData } from "@/types"
import { EarnProtocolInput, USGMarketType, ConvexAprData } from "../usg_type"
import { EarnPoolsData } from "../client_api_external"
import { executeChainViewUnique } from "@/services/service_rpc"

import ConvexAPR from "@/abi/USG/ConvexAPR.json"
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
  { label: "Asset", key: "asset", className: "xl:w-1/3 w-full " },
  {
    label: "Protocol",
    key: "protocol",
    className: "xl:w-1/3 w-full",
  },
  {
    label: "APR",
    key: "currentAPR",
    sort: "sort",
    className: "xl:w-1/3  ",
  },
  { label: "Pts/Day/$", key: "points", sort: "sort", className: "xl:w-1/3  " },
]

export const getConvexRates = async (pids: number[]) => {
  const empty = [] satisfies ConvexAprData[]
  try {
    return (await executeChainViewUnique<ConvexAprData[]>(ConvexAPR.abi as Abi, ConvexAPR.bytecode as Hex, [pids])) || empty
  } catch (e) {
    console.error("ConvexBoost Chainview failed", e)
    return empty
  }
}

export const mapAPROpportunities = (tasks: EarnProtocolInput[], poolsData?: Array<EarnPoolsData>) => {
  const sanitizeValue = (value?: number | null) => (typeof value === "number" && Number.isFinite(value) ? value : 0)
  const sameAddress = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase()
  const getMinAPYValue = (values?: Array<number | null | undefined>) => sanitizeValue(values?.[0])
  const sumAPRValues = (values?: Array<number | null | undefined>) => values?.reduce<number>((sum, value) => sum + sanitizeValue(value), 0) || 0
  const getBaseAPY = (pool?: EarnPoolsData) => {
    const weeklyAPY = sanitizeValue(pool?.apy?.latestWeeklyApy)
    const dailyAPY = sanitizeValue(pool?.apy?.latestDailyApy)

    return weeklyAPY > 0 ? weeklyAPY : dailyAPY
  }

  return tasks.map((t) => {
    const currentPool = poolsData?.find((el) => {
      if (el?.protocol === "Pendle") {
        return (sameAddress(el.address, t.address) && el.protocol === t.protocolName) || sameAddress(el?.pt, t.address) || sameAddress(el?.yt, t.address)
      }

      return (sameAddress(el.address, t.address) && el.protocol === t.protocolName) || null
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
      const rewardToken = "CRV"
      const currentAPRDetails: { APY: number; CRV?: number } = {
        APY: 0,
        CRV: undefined,
      }
      const projectedAPRDetails: { APY: number; CRV?: number } = {
        APY: 0,
        CRV: undefined,
      }
      let currentAPR = 0
      let projectedAPR = 0

      const isCurveUnstaked = t?.protocolName === "Curve" && t?.subLabel === "(unstaked)"
      const isCurveStaked = t?.protocolName === "Curve" && t?.subLabel === "(staked)"

      const minAPYCurr = getMinAPYValue(currentPool?.gaugeCrvApy)
      const minAPYFut = getMinAPYValue(currentPool?.gaugeFutureCrvApy)

      const baseAPY = getBaseAPY(currentPool)
      if (isCurveStaked || isCurveUnstaked) {
        currentAPRDetails.APY = baseAPY
        projectedAPRDetails.APY = baseAPY
        if (isCurveUnstaked) {
          currentAPR = baseAPY
          projectedAPR = -1
          currentAPRDetails.CRV = 0

          projectedAPRDetails.CRV = 0
        } else {
          currentAPRDetails.CRV = minAPYCurr
          projectedAPRDetails.CRV = minAPYFut
          currentAPR = baseAPY + minAPYCurr
          projectedAPR = -1
        }
      } else {
        // STAKE DAO / CONVEX
        const baseApy = sanitizeValue(currentPool?.gaugeCrvApy?.[0])
        const gauge0Curr = sanitizeValue(currentPool?.gaugeCrvApy?.[1])
        const gauge0Fut = sanitizeValue(currentPool?.gaugeFutureCrvApy?.[1])

        currentAPRDetails.APY = baseApy
        currentAPRDetails.CRV = gauge0Curr

        projectedAPRDetails.APY = baseApy
        projectedAPRDetails.CRV = gauge0Fut

        currentAPR = sumAPRValues(currentPool?.gaugeCrvApy)
        projectedAPR = currentPool?.gaugeFutureCrvApy?.at(0) === undefined ? -1 : sumAPRValues(currentPool?.gaugeFutureCrvApy)
      }
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
