import { formatUnits } from "viem"
import { formatNumber } from "@/lib/number_formatter"

// ────────────────────────────────────────
//           RAW DATA (src/data/airdrop.json)
// ────────────────────────────────────────

export type AirdropSummaryBucket = {
  budget: string // wei
  distributed: string // wei
  unresolved: string // wei
  recipients: number
}

export type AirdropSummary = {
  cvgUsers: AirdropSummaryBucket
  cvgPepes: AirdropSummaryBucket
  lpPoints: AirdropSummaryBucket
  votePoints: AirdropSummaryBucket
  preDeposit: AirdropSummaryBucket
  creditors: AirdropSummaryBucket
  partners: AirdropSummaryBucket
  teamOutsideMerkle: string // wei
  distributedTotal: string // wei
  unresolvedTotal: string // wei
  total: string // wei
}

// Amounts inside `details` are decimal strings (already in TAN / token units, not wei)
export type CvgUsersDetails = {
  tan: string
  totalTokens: string
  holders?: string
  lockers?: string
  stakers?: string
  seed?: string
  bonds?: string
  lpEthCvg?: string
  lpFraxbpCvg?: string
  ibo?: string
  wl?: string
}

export type CvgPepesDetails = { tan: string; nfts: number; totalNfts: number }

export type LpPointsDetails = {
  tan: string
  points?: string
  boosterPoints?: string
  referralPoints?: string
  totalPoints: string
  campaignTotalPoints: string
}

export type VotePointsDetails = { tan: string; points: string; totalPoints: string; campaignTotalPoints: string }

export type PreDepositDetails = { tan: string; totalLp: string; "USG-frxUSD"?: string; "USG-USDC"?: string }

export type NamedAllocationDetails = { tan: string; name: string }

export type AirdropRecipientDetails = {
  cvgUsers?: CvgUsersDetails
  cvgPepes?: CvgPepesDetails
  lpPoints?: LpPointsDetails
  votePoints?: VotePointsDetails
  preDeposit?: PreDepositDetails
  creditors?: NamedAllocationDetails
  partners?: NamedAllocationDetails
}

export type AirdropRecipient = {
  address: string
  tan: string // wei
  tanFormatted: string
  details: AirdropRecipientDetails
}

export type AirdropData = {
  generatedAt: string
  summary: AirdropSummary
  recipients: AirdropRecipient[]
}

export type AirdropAllocationResponse = {
  generatedAt: string
  summary: AirdropSummary
  recipient: AirdropRecipient | null
}

// ────────────────────────────────────────
//           CONSTANTS
// ────────────────────────────────────────

export const AIRDROP_SNAPSHOT_DATE = "Oct 30, 2026"

// Team allocation is distributed outside of the merkle tree: only the total is available in airdrop.json
export const TEAM_WALLETS = 6

export type AirdropCategoryId = "compensationCvg" | "pointCampaign" | "preDeposit" | "others"

export const AIRDROP_CATEGORIES: Record<AirdropCategoryId, { label: string; color: string; glow: string }> = {
  compensationCvg: { label: "Compensation CVG", color: "#0075FF", glow: "#0077ffa3" },
  pointCampaign: { label: "Point campaign", color: "#95FF00", glow: "#95ff006d" },
  preDeposit: { label: "Pre-deposit", color: "#00C2FF", glow: "#00c2ff80" },
  others: { label: "Others", color: "#FFFFFF", glow: "#ffffff80" },
}

export const AIRDROP_CATEGORY_ORDER: AirdropCategoryId[] = ["compensationCvg", "pointCampaign", "preDeposit", "others"]

const CVG_USERS_TILES: Array<{ key: keyof Omit<CvgUsersDetails, "tan">; label: string }> = [
  { key: "holders", label: "Holders" },
  { key: "lockers", label: "Lockers" },
  { key: "stakers", label: "Stakers" },
  { key: "seed", label: "Seed" },
  { key: "bonds", label: "Bonds" },
  { key: "lpEthCvg", label: "LP ETH/CVG" },
  { key: "lpFraxbpCvg", label: "LP FRAXBP/CVG" },
  { key: "ibo", label: "IBO" },
  { key: "wl", label: "Whitelist" },
  { key: "totalTokens", label: "Total CVG tokens" },
]

// ────────────────────────────────────────
//           VIEW MODEL
// ────────────────────────────────────────

export type AirdropTile = { label: string; value: string; unit?: string }

export type AirdropSection = { title: string; pool?: number; amount: number; tiles: AirdropTile[] }

export type AirdropCategoryAllocation = {
  id: AirdropCategoryId
  amount: number
  sources: string[]
  sections: AirdropSection[]
}

export type AirdropCategoryDistribution = {
  id: AirdropCategoryId
  pool: number
  tiles: AirdropTile[]
}

const weiToNumber = (wei: string | undefined) => Number(formatUnits(BigInt(wei ?? "0"), 18))

const toNumber = (value: string | number | undefined) => Number(value ?? 0)

export const formatTan = (value: number) => (value > 0 ? formatNumber(value, 0) : "0")

export const formatAmount = (value: string | number | undefined) => formatNumber(Math.floor(toNumber(value)), 0)

export const formatShare = (ratio: number) => `${(Number.isFinite(ratio) ? ratio * 100 : 0).toFixed(1)}%`

export const shortenAddress = (address?: string) => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "")

const pools = (summary: AirdropSummary) => ({
  cvgUsers: weiToNumber(summary.cvgUsers.budget),
  cvgPepes: weiToNumber(summary.cvgPepes.budget),
  lpPoints: weiToNumber(summary.lpPoints.budget),
  votePoints: weiToNumber(summary.votePoints.budget),
  preDeposit: weiToNumber(summary.preDeposit.budget),
  creditors: weiToNumber(summary.creditors.budget),
  partners: weiToNumber(summary.partners.budget),
  team: weiToNumber(summary.teamOutsideMerkle),
})

/**
 * Builds the per-category allocation of a wallet, in the display order of the page.
 * Categories without allocation are returned with `amount: 0` and no sections.
 */
export function buildCategoryAllocations(details: AirdropRecipientDetails | undefined, summary: AirdropSummary): AirdropCategoryAllocation[] {
  const pool = pools(summary)
  const d = details ?? {}

  // Compensation CVG
  const cvgSections: AirdropSection[] = []
  if (d.cvgUsers) {
    const cvgUsers = d.cvgUsers
    cvgSections.push({
      title: "CVG users",
      pool: pool.cvgUsers,
      amount: toNumber(cvgUsers.tan),
      tiles: CVG_USERS_TILES.filter(({ key }) => cvgUsers[key] !== undefined).map(({ key, label }) => ({
        label,
        value: formatAmount(cvgUsers[key]),
        unit: "CVG",
      })),
    })
  }
  if (d.cvgPepes) {
    cvgSections.push({
      title: "CVG Pepes",
      pool: pool.cvgPepes,
      amount: toNumber(d.cvgPepes.tan),
      tiles: [
        { label: "NFTs held", value: `${d.cvgPepes.nfts} / ${d.cvgPepes.totalNfts}` },
        { label: "Your share", value: formatShare(d.cvgPepes.nfts / d.cvgPepes.totalNfts) },
      ],
    })
  }

  // Point campaign
  const pointSections: AirdropSection[] = []
  if (d.lpPoints) {
    const lp = d.lpPoints
    const tiles: AirdropTile[] = []
    if (lp.points !== undefined) tiles.push({ label: "Points", value: formatAmount(lp.points) })
    if (lp.boosterPoints !== undefined) tiles.push({ label: "Booster points", value: formatAmount(lp.boosterPoints) })
    if (lp.referralPoints !== undefined) tiles.push({ label: "Referral points", value: formatAmount(lp.referralPoints) })
    tiles.push(
      { label: "Total points", value: formatAmount(lp.totalPoints) },
      { label: "Campaign total", value: formatAmount(lp.campaignTotalPoints) },
      { label: "Your share", value: formatShare(toNumber(lp.totalPoints) / toNumber(lp.campaignTotalPoints)) }
    )
    pointSections.push({ title: "LP points", pool: pool.lpPoints, amount: toNumber(lp.tan), tiles })
  }
  if (d.votePoints) {
    const vote = d.votePoints
    pointSections.push({
      title: "Vote points",
      pool: pool.votePoints,
      amount: toNumber(vote.tan),
      tiles: [
        { label: "Points", value: formatAmount(vote.totalPoints) },
        { label: "Campaign total", value: formatAmount(vote.campaignTotalPoints) },
        { label: "Your share", value: formatShare(toNumber(vote.totalPoints) / toNumber(vote.campaignTotalPoints)) },
      ],
    })
  }

  // Pre-deposit
  const preDepositSections: AirdropSection[] = []
  if (d.preDeposit) {
    const pd = d.preDeposit
    const tiles: AirdropTile[] = []
    if (pd["USG-frxUSD"] !== undefined) tiles.push({ label: "USG-frxUSD LP", value: formatAmount(pd["USG-frxUSD"]) })
    if (pd["USG-USDC"] !== undefined) tiles.push({ label: "USG-USDC LP", value: formatAmount(pd["USG-USDC"]) })
    tiles.push({ label: "Total LP", value: formatAmount(pd.totalLp) }, { label: "Your share", value: formatShare(toNumber(pd.tan) / pool.preDeposit) })
    preDepositSections.push({ title: "USG LP pre-deposit", pool: pool.preDeposit, amount: toNumber(pd.tan), tiles })
  }

  // Others
  const othersTiles: AirdropTile[] = []
  if (d.creditors) othersTiles.push({ label: `Creditor, ${d.creditors.name}`, value: formatAmount(d.creditors.tan), unit: "TAN" })
  if (d.partners) othersTiles.push({ label: `Partner, ${d.partners.name}`, value: formatAmount(d.partners.tan), unit: "TAN" })
  const othersAmount = toNumber(d.creditors?.tan) + toNumber(d.partners?.tan)
  const othersSections: AirdropSection[] = othersTiles.length ? [{ title: "Allocations", amount: othersAmount, tiles: othersTiles }] : []

  const sum = (sections: AirdropSection[]) => sections.reduce((acc, s) => acc + s.amount, 0)

  return [
    {
      id: "compensationCvg",
      amount: sum(cvgSections),
      sources: [d.cvgUsers && "CVG users", d.cvgPepes && "CVG Pepes"].filter(Boolean) as string[],
      sections: cvgSections,
    },
    {
      id: "pointCampaign",
      amount: sum(pointSections),
      sources: [d.lpPoints && "LP points", d.votePoints && "Vote points"].filter(Boolean) as string[],
      sections: pointSections,
    },
    {
      id: "preDeposit",
      amount: sum(preDepositSections),
      sources: d.preDeposit ? ["USG LP pre-deposit"] : [],
      sections: preDepositSections,
    },
    {
      id: "others",
      amount: othersAmount,
      sources: [d.creditors && "Creditors", d.partners && "Partners"].filter(Boolean) as string[],
      sections: othersSections,
    },
  ]
}

/** Builds the global distribution (pools by category) shown when the wallet has no allocation. */
export function buildDistribution(summary: AirdropSummary): AirdropCategoryDistribution[] {
  const pool = pools(summary)
  const wallets = (n: number) => `${n} wallet${n > 1 ? "s" : ""}`

  return [
    {
      id: "compensationCvg",
      pool: pool.cvgUsers + pool.cvgPepes,
      tiles: [
        { label: `CVG users, ${wallets(summary.cvgUsers.recipients)}`, value: formatTan(pool.cvgUsers), unit: "TAN" },
        { label: `CVG Pepes, ${wallets(summary.cvgPepes.recipients)}`, value: formatTan(pool.cvgPepes), unit: "TAN" },
      ],
    },
    {
      id: "pointCampaign",
      pool: pool.lpPoints + pool.votePoints,
      tiles: [
        { label: `LP points, ${wallets(summary.lpPoints.recipients)}`, value: formatTan(pool.lpPoints), unit: "TAN" },
        { label: `Vote points, ${wallets(summary.votePoints.recipients)}`, value: formatTan(pool.votePoints), unit: "TAN" },
      ],
    },
    {
      id: "preDeposit",
      pool: pool.preDeposit,
      tiles: [{ label: `USG LP pre-deposit, ${wallets(summary.preDeposit.recipients)}`, value: formatTan(pool.preDeposit), unit: "TAN" }],
    },
    {
      id: "others",
      pool: pool.creditors + pool.partners + pool.team,
      tiles: [
        { label: `Creditors, ${wallets(summary.creditors.recipients)}`, value: formatTan(pool.creditors), unit: "TAN" },
        { label: `Partners, ${wallets(summary.partners.recipients)}`, value: formatTan(pool.partners), unit: "TAN" },
        { label: `Team, ${wallets(TEAM_WALLETS)}`, value: formatTan(pool.team), unit: "TAN" },
      ],
    },
  ]
}

/**
 * Splits panels into two columns, alternating in display order
 * (left: Compensation CVG / Pre-deposit, right: Point campaign / Others when all are present).
 */
export function splitInColumns<T>(items: T[]): [T[], T[]] {
  return [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)]
}
