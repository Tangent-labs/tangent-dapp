import { ListHeaderData } from "@/types"
import { EarnProtocolInput, GaugeAPR, StakeDaoAPRData } from "../usg_type"
import { Address } from "viem"

export const tgUsdEarnListHeaders: ListHeaderData[] = [
  { label: "Asset", key: "asset" },
  {
    label: "Protocol",
    key: "protocol",
  },
  {
    label: "APR",
    key: "apr",
    indicator:
      "Annualized cost of borrowing, expressed as a percentage, which includes the interest rate and any additional fees or costs associated with the loan",
  },
  { label: "Points", key: "points" },
]

export const mapTasks = (tasks: EarnProtocolInput[], poolsData?: Array<GaugeAPR>) => {
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
      bonusPts: t.bonusPts,
      address: t.address,
      currentAPR,
      projectedAPR,
    }
  })
}

export const mapPoolsAndTasks = (curvePools: GaugeAPR[], convexPools: GaugeAPR[], stakeDaoPools: StakeDaoAPRData[], tasks: EarnProtocolInput[]) => {
  const allCurvePoolsAddresses = tasks.filter((t) => t.protocolName === "Curve").map((t) => t.address)
  const allConvexPoolsAddresses = tasks.filter((t) => t.protocolName === "Convex").map((t) => t.address)
  const allStakeDaoPoolsPoolsAddresses = tasks.filter((t) => t.protocolName === "StakeDAO").map((t) => t.address)

  const curvePoolsOfInterest = curvePools
    .filter((p: GaugeAPR) => allCurvePoolsAddresses.includes(p.address))
    .map((el) => {
      return { ...el, protocol: "Curve" }
    })

  const convexPoolsOfInterest = convexPools
    .filter((p: GaugeAPR) => allConvexPoolsAddresses.includes(p.address))
    .map((el) => {
      return { ...el, protocol: "Convex" }
    })

  const stakeDaoPoolsOfInterest = stakeDaoPools
    .filter((p: { lpToken: { address: string } }) => allStakeDaoPoolsPoolsAddresses.includes(p.lpToken.address))
    .map((el) => {
      const address = el.lpToken.address as Address
      const gaugeCrvApy = el.apr.current.total
      const gaugeFutureCrvApy = el.apr.projected.total

      return { protocol: "StakeDAO", address, gaugeCrvApy: [gaugeCrvApy], gaugeFutureCrvApy: [gaugeFutureCrvApy] }
    })

  return curvePoolsOfInterest.concat(convexPoolsOfInterest).concat(stakeDaoPoolsOfInterest)
}
