import { Address } from "viem"
import { ListHeaderData } from "@/types"
import { EarnProtocolInput, GaugeAPR, StakeDaoAPRData } from "../usg_type"

export const USGEarnListHeaders: ListHeaderData[] = [
  { label: "Asset", key: "asset" },
  {
    label: "Protocol",
    key: "protocol",
  },
  {
    label: "APR",
    key: "apr",
  },
  { label: "Pts/Day/$", key: "points" },
]

export const mapTasks = (tasks: EarnProtocolInput[], poolsData?: Array<GaugeAPR>) => {
  return tasks.map((t) => {
    const currentPool = poolsData?.find((el) => el.address === t.address && el.protocol === t.protocolName) || null

    const currentAPR = currentPool?.gaugeCrvApy.reduce((sum, n) => sum + n, 0) || 0
    const projectedAPR = currentPool?.gaugeFutureCrvApy.reduce((sum, n) => sum + n, 0) || 0

    // TODO : set rewardToken dynamically
    const rewardToken = "CRV"

    // TODO : fields to be set dynamically
    const currentAPRDetails = { APY: currentPool?.gaugeCrvApy[0], CRV: currentPool?.gaugeCrvApy[1] }
    const projectedAPRDetails = { APY: currentPool?.gaugeFutureCrvApy[0], CRV: currentPool?.gaugeFutureCrvApy[1] }

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
  })
}

export const mapPoolsAndTasks = (curvePools: GaugeAPR[], convexPools: GaugeAPR[], stakeDaoPools: StakeDaoAPRData[], tasks: EarnProtocolInput[]) => {
  const allCurvePoolsAddresses = tasks.filter((t) => t.protocolName === "Curve").map((t) => t.address)
  const allConvexPoolsAddresses = tasks.filter((t) => t.protocolName === "Convex").map((t) => t.address)
  const allStakeDaoPoolsPoolsAddresses = tasks.filter((t) => t.protocolName === "Stake DAO").map((t) => t.address)

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

      return { protocol: "Stake DAO", address, gaugeCrvApy: [gaugeCrvApy], gaugeFutureCrvApy: [gaugeFutureCrvApy] }
    })

  return curvePoolsOfInterest.concat(convexPoolsOfInterest).concat(stakeDaoPoolsOfInterest)
}
