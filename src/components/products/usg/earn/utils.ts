import { Address, formatEther } from "viem"
import { AssetPrices } from "@/types/type_asset"
import { EarnProtocolInput, ConvexAprData } from "../usg_type"
import { EarnPoolsData, StakeDaoAPRData, CurveSubgraphPool, curveAPy } from "../client_api_external"

export const mapPoolsAndTasks = (
  curvePools: EarnPoolsData[],
  convexPools: EarnPoolsData[],
  stakeDaoPools: StakeDaoAPRData[],
  pendlePools: EarnPoolsData[],
  tasks: EarnProtocolInput[],
  subgraphPools: CurveSubgraphPool[],
  convexRates?: ConvexAprData[],
  convexPrices?: AssetPrices
) => {
  const allCurvePoolsAddresses = tasks.filter((t) => t.protocolName === "Curve").map((t) => t.address?.toLowerCase())
  const allConvexPoolsAddresses = tasks.filter((t) => t.protocolName === "Convex").map((t) => t.address?.toLowerCase())
  const allStakeDaoPoolsPoolsAddresses = tasks.filter((t) => t.protocolName === "Stake DAO").map((t) => t.address?.toLowerCase())
  const allPendlePoolsAddresses = tasks.filter((t) => t.protocolName === "Pendle").map((t) => t.address?.toLowerCase())

  const curvePoolsOfInterest = curvePools
    .filter((p: EarnPoolsData) => allCurvePoolsAddresses.includes(p.address?.toLowerCase()))
    .map((el) => {
      const subgraph = { apy: subgraphPools.find((s) => s.address?.toLowerCase() === el.address?.toLocaleLowerCase()) } as curveAPy
      return { ...el, protocol: "Curve", ...subgraph }
    })

  const convexPoolsOfInterest = convexPools
    .filter((p: EarnPoolsData) => allConvexPoolsAddresses.includes(p.address?.toLowerCase()))
    .map((el) => {
      const task = tasks.find((t) => t.protocolName === "Convex" && t.address?.toLowerCase() === el.address?.toLowerCase())
      const rateData = convexRates?.find((r) => Number(r.pid) === task?.pid)

      const rewardApr = (rateData?.yearlyRewardPerLp ?? []).reduce((sum, r) => {
        const price = convexPrices?.[r.token as Address] ?? 0
        const amount = Number(formatEther(r.amount))
        return sum + amount * price * 100
      }, 0)

      const gaugeCrvApy = [el.baseApy, rewardApr]
      const gaugeFutureCrvApy = [undefined, undefined]
      return { address: el.address, protocol: "Convex", gaugeCrvApy, gaugeFutureCrvApy }
    })

  const stakeDaoPoolsOfInterest = stakeDaoPools
    .filter((p) => allStakeDaoPoolsPoolsAddresses.includes(p.vault?.toLowerCase()))
    .map((el) => {
      //  console.log(el)
      const address = el.vault as Address
      const currentDetails = el.apr.current.details || []
      const tradingFees = el.tradingApy || 0

      const rewardAPR =
        currentDetails
          .filter((detail) => !detail.label.toLowerCase().includes("trading fees"))
          .reduce((sum, detail) => sum + (detail.value?.reduce((innerSum, value) => innerSum + value, 0) || 0), 0) || 0

      // v2 does not expose a projected APR in the same shape as the legacy endpoint.
      const gaugeCrvApy = [tradingFees, rewardAPR]
      const gaugeFutureCrvApy = [tradingFees, rewardAPR]

      return { protocol: "Stake DAO", address, lpTokenAddress: el.lpToken.address as Address, gaugeCrvApy, gaugeFutureCrvApy }
    })

  const pendleYT = pendlePools
    ?.filter((p: EarnPoolsData) => allPendlePoolsAddresses.includes(p.address?.toLowerCase()))
    ?.map((pool) => {
      return {
        address: pool?.yt?.substring(2, pool?.yt?.length) as Address,
        pendleBaseAPY: (pool?.details?.impliedApy || 0) * 100,
        protocol: "Pendle",
      }
    })

  const pendlePT = pendlePools
    ?.filter((p: EarnPoolsData) => allPendlePoolsAddresses.includes(p.address?.toLowerCase()))
    ?.map((pool) => {
      return {
        address: pool?.pt?.substring(2, pool?.pt?.length) as Address,
        pendleBaseAPY: (pool?.details?.impliedApy || 0) * 100,
        protocol: "Pendle",
      }
    })

  const pendleLP = pendlePools
    ?.filter((p: EarnPoolsData) => allPendlePoolsAddresses.includes(p.address?.toLowerCase()))
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
