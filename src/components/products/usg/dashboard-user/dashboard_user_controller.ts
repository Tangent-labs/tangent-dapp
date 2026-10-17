import type { ListHeaderData, ListSort } from "@/types"
import type { AllocationItem, BorrowPosition, CurveLPPosition, EarningPeriod, PositionTabKey } from "./dashboard_user_type"

// Projections are derived from the current earnings (per day)
export const PERIOD_MULTIPLIER: Record<EarningPeriod, number> = {
  current: 1,
  weekly: 7,
  monthly: 30,
  annual: 365,
}

export const EARNING_PERIODS: { key: EarningPeriod; label: string }[] = [
  { key: "current", label: "Current" },
  { key: "weekly", label: "Weekly Projection" },
  { key: "monthly", label: "Monthly Projection" },
  { key: "annual", label: "Annual Projection" },
]

export const getSharePercent = (value: number, total: number) => (total > 0 ? (value / total) * 100 : 0)

// Allocation colors (front-owned, so the backend only sends business data)
// A ramp of the dapp palette: Tangent blue, its light cyan, the mint of the peg keepers, then the greens / yellows of sUSG.
// Neighbours on the gauge are neighbours on the color wheel, so it reads as one gradient instead of five unrelated colors.
const ALLOCATION_COLORS: Record<string, string> = {
  "borrow-market": "#0075FF",
  "curve-lps": "#00C2FF",
  pendle: "#24DD9A",
  tan: "#95FF00",
  susg: "#D9FB0B",
}

const ALLOCATION_FALLBACK_COLORS = ["#0075FF", "#00C2FF", "#24DD9A", "#95FF00", "#D9FB0B"]

export const getAllocationColor = (key: string, index: number) =>
  ALLOCATION_COLORS[key] ?? ALLOCATION_FALLBACK_COLORS[index % ALLOCATION_FALLBACK_COLORS.length]

// ---------------------------
// GAUGE
// Semicircle gauge (left to right), one arc per allocation item with a small gap between arcs
// ---------------------------
const GAUGE_CENTER = 125
const GAUGE_RADIUS = 120
const GAUGE_GAP_DEGREES = 2.5
// Angular size of the round line caps (stroke 10) so the visual gap stays constant
const GAUGE_CAP_DEGREES = 2.4

const polar = (angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180
  return { x: GAUGE_CENTER + GAUGE_RADIUS * Math.cos(rad), y: GAUGE_CENTER - GAUGE_RADIUS * Math.sin(rad) }
}

// A single item covering the whole gauge, used to draw the empty state
export const EMPTY_GAUGE_ITEMS: AllocationItem[] = [{ key: "empty", label: "", amount: 1 }]

type GaugeArc = { key: string; color: string; path: string }

export const getGaugeArcs = (items: AllocationItem[]): GaugeArc[] => {
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const visible = items.filter((item) => item.amount > 0)
  if (total <= 0 || visible.length === 0) return []

  const available = 180 - GAUGE_GAP_DEGREES * (visible.length - 1)
  let cursor = 180

  return visible.map((item, index) => {
    const span = (item.amount / total) * available
    const start = cursor
    const end = cursor - span
    cursor = end - GAUGE_GAP_DEGREES

    // Shrink the arc by the cap size, keep at least a dot for tiny segments
    const trimmedSpan = Math.max(span - 2 * GAUGE_CAP_DEGREES, 0.01)
    const from = polar(start - (span - trimmedSpan) / 2)
    const to = polar(end + (span - trimmedSpan) / 2)

    return {
      key: item.key,
      color: getAllocationColor(item.key, index),
      path: `M${from.x.toFixed(2)} ${from.y.toFixed(2)}A${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 0 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`,
    }
  })
}

// ---------------------------
// TABS
// ---------------------------
export const POSITION_TABS: { key: PositionTabKey; label: string }[] = [
  { key: "borrow", label: "Borrow Market" },
  { key: "curve-lps", label: "Curve LPs Staked" },
  { key: "susg", label: "sUSG" },
]

// ---------------------------
// BORROW POSITIONS TABLE
// ---------------------------
export const BORROW_HEADERS: ListHeaderData[] = [
  { label: "Collateral", key: "collateral", sort: "sort" },
  { label: "Deposited", key: "deposited", sort: "sort" },
  { label: "Debt", key: "debt", sort: "sort" },
  { label: "Health", key: "health", sort: "sort", indicator: "Health factor of the position. Below 1 the position can be liquidated." },
  { label: "Claimable", key: "claimable" },
  { label: "vAPR", key: "vapr", sort: "sort", indicator: "vAPR of the collateral." },
  { label: "Borrow Rate", key: "borrowRate", sort: "sort", indicator: "Interest rate that borrowers pay on their outstanding debt." },
  { label: "Net vAPR", key: "netVapr", indicator: "Net vAPR of your position, computed from your saved simulation in the vAPR calculator." },
]

export const CURVE_LP_HEADERS: ListHeaderData[] = [
  { label: "Collateral", key: "collateral" },
  { label: "vAPR", key: "vapr", sort: "sort", indicator: "vAPR of the LP." },
  { label: "Deposited", key: "deposited", sort: "sort" },
  { label: "Claimable", key: "claimable" },
  { label: "Claim", key: "claim" },
]

export const SUSG_HEADERS: ListHeaderData[] = [
  { label: "Collateral", key: "collateral" },
  { label: "APY", key: "apy", indicator: "Yearly yield of sUSG, paid by the protocol revenues." },
  { label: "Deposited", key: "deposited" },
  { label: "Balance", key: "balance" },
]

const SORT_VALUE: Record<string, (p: BorrowPosition) => number | string> = {
  collateral: (p) => p.name.toLowerCase(),
  deposited: (p) => p.depositedUsd,
  debt: (p) => p.debt,
  health: (p) => p.health ?? Number.POSITIVE_INFINITY,
  vapr: (p) => p.apr.current,
  borrowRate: (p) => p.borrowRate,
}

export const sortBorrowPositions = (positions: BorrowPosition[], sort: ListSort): BorrowPosition[] => sortPositions(positions, sort, SORT_VALUE)

const LP_SORT_VALUE: Record<string, (p: CurveLPPosition) => number | string> = {
  vapr: (p) => p.apr.current,
  deposited: (p) => p.depositedUsd,
}

export const sortCurveLPPositions = (positions: CurveLPPosition[], sort: ListSort): CurveLPPosition[] => sortPositions(positions, sort, LP_SORT_VALUE)

const sortPositions = <T>(positions: T[], sort: ListSort, values: Record<string, (p: T) => number | string>): T[] => {
  const getValue = values[sort.key]
  if (!getValue || sort.direction === "none") return positions

  const direction = sort.direction === "asc" ? 1 : -1
  return [...positions].sort((a, b) => {
    const va = getValue(a)
    const vb = getValue(b)
    if (typeof va === "string" || typeof vb === "string") return String(va).localeCompare(String(vb)) * direction
    return (va - vb) * direction
  })
}

// Clicking a position leads to the position on its market page
export const getPositionRoute = (marketAddress: string) => `/${marketAddress}/deposit-borrow`

// Same buckets as the health colors used on the market pages: green when comfortable, orange then red when close to liquidation
export const getHealthColor = (health: number | null) => {
  if (health === null) return undefined
  if (health >= 1.5) return "var(--tgt-row-success)"
  if (health >= 1.2) return "var(--tgt-slippage-warning)"
  if (health >= 1.05) return "var(--tgt-row-warning)"
  return "var(--tgt-row-danger)"
}
