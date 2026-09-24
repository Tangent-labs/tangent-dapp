import type { Address, WalletClient } from "viem"
import { doMultiClaim, doSimpleClaim } from "../claim/usg_claim_controller"
import type { MarketKind, UserDashboardData } from "./dashboard_user_type"

/**
 * Claim rewards popup: what can be claimed, grouped by kind of position, and how it is claimed.
 * Only the kinds of position the wallet actually has (with something to claim) get a section.
 */

// One position with rewards to claim
export type ClaimableRow = {
  // Market address for the positions claimed on-chain, pool key for the Curve LPs
  id: string
  name: string
  logoKey: string
  rewardTokens: string[]
  marketKind?: MarketKind
  claimableUsd: number
  claimableRewards: { token: string; usd: number }[]
  // Rows with a link are claimed on their own page (opened in a new tab). The others are claimed in one transaction
  claimUrl?: string
}

export type ClaimSection = {
  key: string
  label: string
  rows: ClaimableRow[]
}

// Kinds of position with rewards to claim. To add TAN positions, add an entry here.
export const getClaimSections = ({ borrowPositions, curveLPPositions }: UserDashboardData): ClaimSection[] => {
  const borrowRows: ClaimableRow[] = borrowPositions
    .filter((position) => position.claimableUsd > 0)
    .map((position) => ({
      id: position.marketAddress,
      name: position.name,
      logoKey: position.logoKey,
      rewardTokens: position.rewardTokens,
      marketKind: position.marketKind,
      claimableUsd: position.claimableUsd,
      claimableRewards: position.claimableRewards,
    }))

  const curveRows: ClaimableRow[] = curveLPPositions
    .filter((position) => position.claimableUsd > 0)
    .map((position) => ({
      id: position.key,
      name: position.name,
      logoKey: position.logoKey,
      rewardTokens: position.rewardTokens,
      claimableUsd: position.claimableUsd,
      claimableRewards: [{ token: position.rewardToken, usd: position.claimableUsd }],
      claimUrl: position.claimUrl,
    }))

  return [
    { key: "borrow-market", label: "Borrow Market", rows: borrowRows },
    { key: "curve-lps", label: "Curve LPs Staked", rows: curveRows },
  ].filter((section) => section.rows.length > 0)
}

// The rows claimed on-chain are selected when the popup opens, the ones claimed elsewhere are not (they open a page)
export const isSelectedByDefault = (row: ClaimableRow) => !row.claimUrl

// Same transactions as the Claim page: one market is claimed alone, several at once with the number of reward tokens
const countRewardTokens = (rows: ClaimableRow[]) => new Set(rows.flatMap((row) => row.claimableRewards.filter((r) => r.usd > 0).map((r) => r.token))).size

export const hasOnChainRows = (rows: ClaimableRow[]) => rows.some((row) => !row.claimUrl)

// Opens the claim page of the rows that are claimed elsewhere (call it from the click, before any await, or the
// browser blocks the new tabs), then claims the others in one transaction
export const claimRewards = async (rows: ClaimableRow[], walletClient?: WalletClient) => {
  rows.filter((row) => row.claimUrl).forEach((row) => window.open(row.claimUrl, "_blank", "noopener,noreferrer"))

  const onChainRows = rows.filter((row) => !row.claimUrl)
  if (onChainRows.length === 0 || !walletClient) return

  const markets = onChainRows.map((row) => row.id as Address)

  return markets.length === 1 ? doSimpleClaim(markets[0], walletClient) : doMultiClaim(markets, countRewardTokens(onChainRows), walletClient)
}

// Total claimable per reward token over the given rows, biggest first
export const getRewardTotals = (rows: ClaimableRow[]) => {
  const totals = new Map<string, number>()

  rows.forEach((row) => row.claimableRewards.forEach(({ token, usd }) => totals.set(token, (totals.get(token) ?? 0) + usd)))

  return Array.from(totals, ([token, usd]) => ({ token, usd })).sort((a, b) => b.usd - a.usd)
}
