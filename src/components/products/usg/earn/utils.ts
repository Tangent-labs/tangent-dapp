import { Address, formatEther } from "viem"
import { EarnProtocolInput, ConvexBoostData, ConvexBoostDataGauge } from "../usg_type"
import { EarnPoolsData, StakeDaoAPRData, CurveSubgraphPool, curveAPy } from "../client_api_external"

export const mapPoolsAndTasks = (
  curvePools: EarnPoolsData[],
  convexPools: EarnPoolsData[],
  stakeDaoPools: StakeDaoAPRData[],
  pendlePools: EarnPoolsData[],
  tasks: EarnProtocolInput[],
  subgraphPools: CurveSubgraphPool[],
  convexBoost: ConvexBoostData
) => {
  const allCurvePoolsAddresses = tasks.filter((t) => t.protocolName === "Curve").map((t) => t.address)
  const allConvexPoolsAddresses = tasks.filter((t) => t.protocolName === "Convex").map((t) => t.address)
  const allStakeDaoPoolsPoolsAddresses = tasks.filter((t) => t.protocolName === "Stake DAO").map((t) => t.address)
  const allPendlePoolsAddresses = tasks.filter((t) => t.protocolName === "Pendle").map((t) => t.address)

  // console.log(allConvexPoolsAddresses)

  const curvePoolsOfInterest = curvePools
    .filter((p: EarnPoolsData) => allCurvePoolsAddresses.includes(p.address))
    .map((el) => {
      const subgraph = { apy: subgraphPools.find((s) => s.address === el.address) } as curveAPy
      return { ...el, protocol: "Curve", ...subgraph }
    })

  const convexFees = Number(formatEther(convexBoost?.fee || 0n))
  const convexPoolsOfInterest = convexPools
    .filter((p: EarnPoolsData) => allConvexPoolsAddresses.includes(p.address))
    .map((el) => {
      const task = tasks.find((t) => t.protocolName === "Convex" && t.address === el.address)
      const boostItem = convexBoost?.gaugeBoosts?.find((b: ConvexBoostDataGauge) => Number(b.pid) === task?.pid)
      const boost = Number(formatEther(boostItem?.boost || 0n))
      const processConvexAPR = (value: number) => (value || 0) * boost * (1 - convexFees)

      const gaugeCrvApy = [el.baseApy, processConvexAPR(el.gaugeCrvApy?.at(0) || 0)]
      const gaugeFutureCrvApy = [el.baseApy, processConvexAPR(el.gaugeFutureCrvApy?.at(0) || 0)]
      return { address: el.address, protocol: "Convex", gaugeCrvApy, gaugeFutureCrvApy }
    })

  const stakeDaoPoolsOfInterest = stakeDaoPools
    .filter((p: { lpToken: { address: string } }) => allStakeDaoPoolsPoolsAddresses.includes(p.lpToken.address))
    .map((el) => {
      //  console.log(el)
      const address = el.lpToken.address as Address
      const currentDetails = el.apr.current.details || []
      const tradingFees = el.tradingApy || 0

      const rewardAPR =
        currentDetails
          .filter((detail) => !detail.label.toLowerCase().includes("trading fees"))
          .reduce((sum, detail) => sum + (detail.value?.reduce((innerSum, value) => innerSum + value, 0) || 0), 0) || 0

      // v2 does not expose a projected APR in the same shape as the legacy endpoint.
      // Keep current values for the projected slot so the existing UI remains stable.
      const gaugeCrvApy = [tradingFees, rewardAPR]
      const gaugeFutureCrvApy = [tradingFees, rewardAPR]

      return { protocol: "Stake DAO", address, gaugeCrvApy, gaugeFutureCrvApy }
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

  // @ts-expect-error multiple format
  return curvePoolsOfInterest.concat(convexPoolsOfInterest).concat(stakeDaoPoolsOfInterest)?.concat(pendlePoolsOfInterest)
}
