import { Address, formatEther } from "viem"
import { COMMON_ERC20S } from "@tangent/defi-resources"
import { EarnProtocolInput, ConvexBoostData, ConvexBoostDataGauge, ConvexRewardRate } from "../usg_type"
import { EarnPoolsData, StakeDaoAPRData, CurveSubgraphPool, curveAPy } from "../client_api_external"

// Convex uses an exact 365-day year for its APR helper (matches PoolUtilities.apr).
const SECONDS_PER_YEAR = 365 * 86400

// Pluck a token's USD price from any Curve pool that contains it as a coin.
// Curve's /getPools/all response embeds usdPrice on every coin, so we can skip a dedicated price fetch.
const findCoinPrice = (pools: EarnPoolsData[], tokenAddress: string): number => {
  const target = tokenAddress.toLowerCase()
  for (const pool of pools) {
    const coin = pool?.coins?.find((c) => c?.address?.toLowerCase() === target)
    if (coin?.usdPrice != null) return coin.usdPrice
  }
  return 0
}

export const mapPoolsAndTasks = (
  curvePools: EarnPoolsData[],
  convexPools: EarnPoolsData[],
  stakeDaoPools: StakeDaoAPRData[],
  pendlePools: EarnPoolsData[],
  tasks: EarnProtocolInput[],
  subgraphPools: CurveSubgraphPool[],
  convexBoost: ConvexBoostData,
  convexRewardRates: ConvexRewardRate[] = []
) => {
  const crvPriceUSD = findCoinPrice(curvePools, COMMON_ERC20S.CRV)
  const cvxPriceUSD = findCoinPrice(curvePools, COMMON_ERC20S.CVX)

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

  const convexFees = Number(formatEther(convexBoost?.fee || 0n))
  const convexPoolsOfInterest = convexPools
    .filter((p: EarnPoolsData) => allConvexPoolsAddresses.includes(p.address?.toLowerCase()))
    .map((el) => {
      const task = tasks.find((t) => t.protocolName === "Convex" && t.address?.toLowerCase() === el.address?.toLowerCase())
      const boostItem = convexBoost?.gaugeBoosts?.find((b: ConvexBoostDataGauge) => Number(b.pid) === task?.pid)
      const boost = Number(formatEther(boostItem?.boost || 0n))
      const rateItem = convexRewardRates.find((r) => r.pid === task?.pid)

      // LP USD price from the pool's own TVL / supply (works for stable and non-stable pools alike).
      const lpSupplyEth = el.totalSupply ? Number(formatEther(BigInt(el.totalSupply))) : 0
      const lpPriceUSD = lpSupplyEth > 0 && el.usdTotal ? el.usdTotal / lpSupplyEth : 1

      // Current rates come from PoolUtilities.rewardRates (already post-fee, streamed by Convex).
      // 100× converts the decimal APR into a percent to match the rest of this pipeline.
      const aprPct = (ratePerSec: number, priceUSD: number) => ((ratePerSec * SECONDS_PER_YEAR * priceUSD) / lpPriceUSD) * 100
      const currentCrvApy = rateItem ? aprPct(rateItem.crvRatePerSec, crvPriceUSD) : 0
      const currentCvxApy = rateItem ? aprPct(rateItem.cvxRatePerSec, cvxPriceUSD) : 0

      // Projected = forward-looking gauge max-boost rate, post Convex fees.
      const futureCrvApy = (el.gaugeFutureCrvApy?.at(0) || 0) * boost * (1 - convexFees)

      const gaugeCrvApy = [el.baseApy, currentCrvApy, currentCvxApy]
      const gaugeFutureCrvApy = [el.baseApy, futureCrvApy]
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
