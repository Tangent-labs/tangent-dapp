import { Address } from "viem"
import { ListHeaderData } from "@/types"
import { EarnPoolsData, EarnProtocolInput, StakeDaoAPRData } from "../usg_type"

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

export const mapTasks = (tasks: EarnProtocolInput[], poolsData?: Array<EarnPoolsData>) => {
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
        rewardToken,
        currentAPRDetails,
        projectedAPRDetails,
      }
    }
  })
}

export const mapPoolsAndTasks = (
  curvePools: EarnPoolsData[],
  convexPools: EarnPoolsData[],
  stakeDaoPools: StakeDaoAPRData[],
  pendlePools: EarnPoolsData[],
  tasks: EarnProtocolInput[]
) => {
  const allCurvePoolsAddresses = tasks.filter((t) => t.protocolName === "Curve").map((t) => t.address)
  const allConvexPoolsAddresses = tasks.filter((t) => t.protocolName === "Convex").map((t) => t.address)
  const allStakeDaoPoolsPoolsAddresses = tasks.filter((t) => t.protocolName === "Stake DAO").map((t) => t.address)
  const allPendlePoolsAddresses = tasks.filter((t) => t.protocolName === "Pendle").map((t) => t.address)

  const curvePoolsOfInterest = curvePools
    .filter((p: EarnPoolsData) => allCurvePoolsAddresses.includes(p.address))
    .map((el) => {
      return { ...el, protocol: "Curve" }
    })

  const convexPoolsOfInterest = convexPools
    .filter((p: EarnPoolsData) => allConvexPoolsAddresses.includes(p.address))
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

  const pendleYT = pendlePools
    ?.filter((p: EarnPoolsData) => allPendlePoolsAddresses.includes(p.address))
    ?.map((pool) => {
      return {
        address: pool?.yt?.substring(2, pool?.yt?.length) as Address,
        pendleBaseAPY: (pool?.details?.impliedApy || 0) * 100,
        protocol: "Pendle",
      }
    })

  const pendlePT = pendlePools
    ?.filter((p: EarnPoolsData) => allPendlePoolsAddresses.includes(p.address))
    ?.map((pool) => {
      return {
        address: pool?.pt?.substring(2, pool?.pt?.length) as Address,
        pendleBaseAPY: (pool?.details?.impliedApy || 0) * 100,
        protocol: "Pendle",
      }
    })

  const pendleLP = pendlePools
    ?.filter((p: EarnPoolsData) => allPendlePoolsAddresses.includes(p.address))
    ?.map((pool) => {
      return {
        address: pool.address as Address,
        pendleBaseAPY: (pool?.details?.aggregatedApy || 0) * 100,
        protocol: "Pendle",
      }
    })

  const pendlePoolsOfInterest = pendleYT?.concat(pendlePT)?.concat(pendleLP)

  return curvePoolsOfInterest.concat(convexPoolsOfInterest).concat(stakeDaoPoolsOfInterest)?.concat(pendlePoolsOfInterest)
}
