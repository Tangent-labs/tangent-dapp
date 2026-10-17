import { zeroAddress } from "viem"
import { getMarketsAprs, getSavingsAPY } from "../client_api"
import { getUSGsUSGMetrics } from "../usg_controller"
import { getUSGMarketsData } from "../list/usg_market_controller"
import { getRewardTokensInfos, getUSGClaimOnChainData, transformClaimOnChainData } from "../claim/usg_claim_controller"
import type { ChainViewMarketList, ClaimData, MarketAPRs, SavingAccountsApy, USGStakingInfo } from "../usg_type"

/**
 * Raw data the dapp already knows how to load for a wallet (on-chain views and the existing API client).
 * Nothing is computed here, see dashboard_user_adapters.ts for the mapping to the dashboard contract.
 *
 * A source that fails is replaced by an empty value so one broken call does not blank the whole dashboard.
 */
export type DashboardSources = {
  // Every market with the wallet position on it (collateral, debt, health, borrow rate, constants)
  markets: ChainViewMarketList | undefined
  // Rewards ready to claim per market, priced in USD
  claims: ClaimData[]
  // Collateral vAPR per market (current and projected, with the detail per reward token)
  marketAprs: MarketAPRs[]
  // sUSG balance and price of the wallet
  susg: USGStakingInfo | undefined
  savingsApys: SavingAccountsApy[]
}

const safe = async <T>(name: string, promise: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await promise
  } catch (error) {
    console.error(`User dashboard: "${name}" failed to load`, error)
    return fallback
  }
}

const loadClaims = async (address: string, marketAprs: MarketAPRs[]) => {
  const claimerInfos = await getUSGClaimOnChainData(address)
  if (!claimerInfos) return []

  const rewardsInfo = await getRewardTokensInfos(claimerInfos)

  return rewardsInfo ? transformClaimOnChainData(claimerInfos, rewardsInfo, marketAprs) : []
}

export const fetchDashboardSources = async (address: string): Promise<DashboardSources> => {
  // Not connected: same convention as the rest of the dapp, the views are read for the zero address (no position)
  const user = address || zeroAddress

  const marketAprs = await safe("markets APR", getMarketsAprs(), [])

  const [markets, claims, susg, savingsApys] = await Promise.all([
    safe("markets", getUSGMarketsData(user), undefined),
    safe("claims", loadClaims(user, marketAprs), []),
    safe("sUSG", getUSGsUSGMetrics(user), undefined),
    safe("savings APY", getSavingsAPY(), []),
  ])

  return { markets, claims, marketAprs, susg, savingsApys }
}
