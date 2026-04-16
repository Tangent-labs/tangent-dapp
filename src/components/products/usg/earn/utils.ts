import { Address } from "viem"
import { EarnProtocolInput } from "../usg_type"
import { EarnPoolsData, StakeDaoAPRData } from "../client_api_external"

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
      const currentDetails = el.apr.current.details || []
      const tradingFees = currentDetails.find((detail) => detail.label.toLowerCase().includes("trading fees"))?.value?.[0] || el.tradingApy || 0
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

  // TODO : Implement the correct behaviour/APR
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
