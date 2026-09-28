import type { AllocationItem, EarningLine, UserDashboardData } from "./dashboard_user_type"

/**
 * Everything the top of the page shows (totals, allocation, earnings) is derived from the positions, so the numbers
 * always match the tables below. Pure functions, no fetching.
 */

const DAYS_PER_YEAR = 365

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

// ---------------------------
// SECTIONS
// One entry per kind of position. When Pendle or TAN positions exist in the dapp, add an entry here (and a tab in
// POSITION_TABS): the allocation, the earnings and the colors are already ready for their keys.
// ---------------------------
type PositionSection = {
  key: string
  label: string
  // Value of the positions of this section in USD
  getDepositedUsd: (data: UserDashboardData) => number
  // Yield per day estimated from the current APR / APY, in USD
  getDailyYieldUsd: (data: UserDashboardData) => number
}

const SECTIONS: PositionSection[] = [
  {
    key: "borrow-market",
    label: "Borrow Market",
    getDepositedUsd: ({ borrowPositions }) => sum(borrowPositions.map((p) => p.depositedUsd)),
    // Rewards are already net of the protocol cut, the interest of the debt is deducted
    getDailyYieldUsd: ({ borrowPositions }) =>
      sum(borrowPositions.map((p) => (p.depositedUsd * p.apr.current) / 100 - (p.debt * p.borrowRate) / 100)) / DAYS_PER_YEAR,
  },
  {
    key: "curve-lps",
    label: "Curve LPs Staked",
    getDepositedUsd: ({ curveLPPositions }) => sum(curveLPPositions.map((p) => p.depositedUsd)),
    getDailyYieldUsd: ({ curveLPPositions }) => sum(curveLPPositions.map((p) => (p.depositedUsd * p.apr.current) / 100)) / DAYS_PER_YEAR,
  },
  {
    key: "susg",
    label: "sUSG",
    getDepositedUsd: ({ susgPosition }) => susgPosition?.balanceUsd ?? 0,
    getDailyYieldUsd: ({ susgPosition }) => (susgPosition ? (susgPosition.balanceUsd * susgPosition.apy) / 100 / DAYS_PER_YEAR : 0),
  },
]

export type DashboardSummary = {
  totalDeposited: number
  totalDebt: number
  totalHeldInLPs: number
  totalSUSG: number
  totalSUSGUsd: number
  totalClaimable: number
  allocation: AllocationItem[]
  // Earnings per day
  earnings: EarningLine[]
}

export const getDashboardSummary = (data: UserDashboardData): DashboardSummary => {
  const { borrowPositions, curveLPPositions, susgPosition } = data

  // An empty section is not displayed
  const allocation = SECTIONS.map(({ key, label, getDepositedUsd }) => ({ key, label, amount: getDepositedUsd(data) })).filter((item) => item.amount > 0)

  // Real earnings if the backend sends them, otherwise an estimation (an earning cannot be negative on the page)
  const earnings =
    data.earnings ?? SECTIONS.map(({ key, label, getDailyYieldUsd }) => ({ key, label, amount: getDailyYieldUsd(data) })).filter((line) => line.amount > 0)

  return {
    totalDeposited: sum(borrowPositions.map((p) => p.depositedUsd)),
    totalDebt: sum(borrowPositions.map((p) => p.debt)),
    totalHeldInLPs: sum(curveLPPositions.map((p) => p.depositedUsd)),
    totalSUSG: susgPosition?.amount ?? 0,
    totalSUSGUsd: susgPosition?.balanceUsd ?? 0,
    totalClaimable: sum([...borrowPositions.map((p) => p.claimableUsd), ...curveLPPositions.map((p) => p.claimableUsd)]),
    allocation,
    earnings,
  }
}
