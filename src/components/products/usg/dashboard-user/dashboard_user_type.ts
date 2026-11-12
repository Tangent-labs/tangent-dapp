// Contract between the front and the backend for the user dashboard. All amounts are plain numbers in USD unless stated otherwise.
export type EarningPeriod = "current" | "weekly" | "monthly" | "annual"

type EarningDetail = {
  token: string
  amount: number
  usd: number
}

// `amount` is what the user earns per day, in USD. Weekly / monthly / annual projections are derived from it in the front.
export type EarningLine = {
  key: string
  label: string
  amount: number
  details?: EarningDetail[]
}

// `key` is a stable id (borrow-market, curve-lps, pendle, tan, susg). Colors are owned by the front (see dashboard_user_controller.ts).
export type AllocationItem = {
  key: string
  label: string
  amount: number
}

// ---------------------------
// POSITIONS
// ---------------------------
export type PositionTabKey = "borrow" | "curve-lps" | "susg"

export type MarketKind = "HEC" | "LEC" | "FIR"

// Parameters needed to simulate the vAPR of a position against USG's price (see docs: HEC / LEC / FIR markets).
// Prices are in USD, rates are in % per year.
type MarketPricingParams = {
  // HEC: below this price 100% of rewards are cut and interest starts. LEC: unused
  priceThreshold: number
  // Price under which the interest rate is at its maximum
  minPrice: number
  // Interest rate at `minPrice` (LEC / HEC). For FIR, the fixed rate is `BorrowPosition.borrowRate`
  maxRate: number
  // LEC only: interest rate when USG is at 1
  minRate: number
}

// One borrow position (CDP) of the user on one market
export type BorrowPosition = {
  // Route target: /{marketAddress}/deposit-borrow
  marketAddress: string
  // Market name, e.g. "crvUSD-USDC" (displayed as crvUSD/USDC)
  name: string
  // Token image key of the collateral (public/medias/tokens/{logoKey}.webp)
  logoKey: string
  // Tokens streamed as rewards by the collateral (CRV, CVX, SDT, PENDLE, FXN)
  rewardTokens: string[]
  // Token whose APR decides which vAPR is displayed (same as market list `rewardToken`)
  rewardToken: string
  marketKind: MarketKind

  // Collateral value in USD
  depositedUsd: number
  // Debt in USG
  debt: number
  // Health factor, null when there is no debt
  health: number | null
  // Rewards ready to be claimed in USD
  claimableUsd: number
  // The same rewards per token (used by the claim popup, and to know how many tokens are claimed)
  claimableRewards: { token: string; usd: number }[]

  // Collateral vAPR in %, same shape as the market list (`apr.current`, `currentAPRDetails`...)
  apr: { current: number; projected: number }
  currentAPRDetails?: Record<string, number | undefined>
  projectedAPRDetails?: Record<string, number | undefined>
  // Interest rate paid on the debt in %
  borrowRate: number

  // Liquidation threshold as a ratio (0.85 = 85%)
  liquidationThreshold: number
  pricing: MarketPricingParams
}

// A Curve LP of the protocol (USG pools) staked by the user
export type CurveLPPosition = {
  // Stable id, e.g. the pool address
  key: string
  // Pool name, e.g. "USG-USDC" (displayed as USG/USDC)
  name: string
  // Token image key of the LP (public/medias/tokens/{logoKey}.webp)
  logoKey: string
  rewardTokens: string[]
  rewardToken: string
  // Same shape as the earn page (`apr`, `currentAPRDetails`...), in %
  apr: { current: number; projected: number }
  currentAPRDetails?: Record<string, number | undefined>
  projectedAPRDetails?: Record<string, number | undefined>
  depositedUsd: number
  claimableUsd: number
  // Where the user claims the rewards of this LP (opened in a new tab)
  claimUrl: string
}

// sUSG held by the user (savings account)
export type SUSGPosition = {
  // Yearly rate in %
  apy: number
  // Number of sUSG tokens held
  amount: number
  depositedUsd: number
  balanceUsd: number
}

// Same shape as the simulation saved by the market page calculator (localStorage key `vapr-calculator:{marketAddress}`)
export type VAPRSimulation = {
  isLeveraged: boolean
  initialCollatAmount?: number
  totalCollatAmount?: number
  simulatedCollatAmount?: number
  debtFarming: number
  debtVAPR: number
}

export type VAPRPoint = { price: number; vAPR: number }

// What the backend has to provide. The totals, the allocation and the earnings estimation are derived from the
// positions by the front (see dashboard_user_summary.ts), so they always match the tables.
export type UserDashboardData = {
  address: string
  // Current USG price in USD (drives the vAPR calculator)
  usgPrice: number
  borrowPositions: BorrowPosition[]
  curveLPPositions: CurveLPPosition[]
  // null when the user holds no sUSG
  susgPosition: SUSGPosition | null
  // Optional: real earnings per day (with the detail per token). Without it, the front estimates them from the APRs
  earnings?: EarningLine[]
}
