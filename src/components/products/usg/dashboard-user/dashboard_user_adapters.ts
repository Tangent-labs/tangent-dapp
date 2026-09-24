import { formatEther, formatUnits } from "viem"
import { USG_CONTRACT, USGMarkets } from "../usg_repository"
import { getRewardTokenFromAprDetails, isFixedRateMarket } from "../list/usg_market_controller"
import type { ChainViewMarketRow, USGMarketType } from "../usg_type"
import type { DashboardSources } from "./dashboard_user_sources"
import type { BorrowPosition, MarketKind, SUSGPosition, UserDashboardData } from "./dashboard_user_type"

/**
 * Maps what the dapp already loads (see dashboard_user_sources.ts) to the dashboard contract
 * (see dashboard_user_type.ts). Pure functions, no fetching. If the backend sends a `UserDashboardData` directly, none of this is needed.
 */

// The liquidation threshold is stored with 5 decimals (85000 = 85%), like in the market page calculator
const LIQUIDATION_THRESHOLD_DECIMALS = 5
// Interest rates are stored as a continuous rate with 5 decimals, the yearly rate is exp(r) - 1
const RATE_DECIMALS = 5
// Prices of the interest rate model are stored with 6 decimals
const PRICE_DECIMALS = 6

const sum = (values: Iterable<number>) => Array.from(values).reduce((total, value) => total + value, 0)

const sumOfValues = (record?: Record<string, number | undefined>) => sum(Object.values(record ?? {}).map(Number))

const toYearlyRatePercent = (continuousRate: number) => (Math.exp(continuousRate) - 1) * 100

// Same icons as the market pages (MarketMetadata): the tokens the collateral streams as rewards
const getRewardTokens = (marketType?: USGMarketType) => {
  const tokens: string[] = []

  if (marketType?.includes("CRV") || marketType?.startsWith("Convex_")) tokens.push("CRV")
  if (marketType?.startsWith("Convex_")) tokens.push("CVX")
  if (marketType?.startsWith("STAKEDAO")) tokens.push("SDT")
  if (marketType?.startsWith("Pendle")) tokens.push("PENDLE")
  if (marketType?.includes("FXN")) tokens.push("FXN")

  return tokens
}

const getMarketKind = (irParams: ChainViewMarketRow["constants"]["irParams"]): MarketKind => {
  if (isFixedRateMarket(irParams)) return "FIR"
  return irParams.isHEC ? "HEC" : "LEC"
}

// ---------------------------
// BORROW POSITIONS
// ---------------------------
const toBorrowPositions = ({ markets, claims, marketAprs }: DashboardSources): BorrowPosition[] => {
  if (!markets) return []

  return markets.rowInfos
    .filter((row) => row.collateralInfos.positionCollateralUSDValue > 0n || row.debtInfos.userDebt > 0n)
    .flatMap((row) => {
      const market = USGMarkets.find((m) => m.marketAddress.toLowerCase() === row.marketAddress.toLowerCase())
      // Markets that are not configured in the dapp cannot be displayed
      if (!market) return []

      const { irParams, liquidationThreshold } = row.constants

      const aprs = marketAprs.find((m) => m.marketAddress.toLowerCase() === row.marketAddress.toLowerCase())
      const claim = claims.find((c) => c.marketAddress.toLowerCase() === row.marketAddress.toLowerCase())

      const depositedUsd = Number(formatEther(row.collateralInfos.positionCollateralUSDValue))
      const debt = Number(formatEther(row.debtInfos.userDebt))
      const lt = Number(liquidationThreshold) / 10 ** LIQUIDATION_THRESHOLD_DECIMALS

      const currentApr = sumOfValues(aprs?.currentAPR)
      const projectedApr = market.marketType === "Pendle_PT" ? currentApr : sumOfValues(aprs?.projectedAPR)

      const maxRate = toYearlyRatePercent(Number(irParams.rMax) / 10 ** RATE_DECIMALS)
      const minRate = toYearlyRatePercent(Number(irParams.rMin) / 10 ** RATE_DECIMALS)

      return {
        marketAddress: row.marketAddress,
        name: market.marketName,
        logoKey: market.logoKey,
        rewardTokens: getRewardTokens(market.marketType),
        rewardToken: getRewardTokenFromAprDetails(aprs?.currentAPR ?? {}, market.marketType ?? "Curve"),
        marketKind: getMarketKind(irParams),

        depositedUsd,
        debt,
        health: debt > 0 ? (depositedUsd * lt) / debt : null,
        claimableUsd: Number(claim?.totalClaimableValue ?? 0),
        claimableRewards: (claim?.claimable ?? []).map((reward) => ({ token: reward.symbol, usd: Number(reward.valueInUsd) })),

        apr: { current: currentApr, projected: projectedApr },
        currentAPRDetails: aprs?.currentAPR,
        projectedAPRDetails: aprs?.projectedAPR,
        borrowRate: toYearlyRatePercent(Number(formatUnits(row.debtInfos.currentBorrowRate, 18))),

        liquidationThreshold: lt,
        pricing: {
          // HEC: interest starts once USG is under the top of the price range, rewards are cut before
          priceThreshold: Number(irParams.pMax) / 10 ** PRICE_DECIMALS,
          minPrice: Number(irParams.pMin) / 10 ** PRICE_DECIMALS,
          maxRate,
          minRate,
        },
      }
    })
}

// ---------------------------
// sUSG
// ---------------------------
const toSUSGPosition = ({ susg, savingsApys }: DashboardSources): SUSGPosition | null => {
  if (!susg || susg.sUSGBalance <= 0n) return null

  const apy = savingsApys.find((v) => v.tokenAddress.toLowerCase() === USG_CONTRACT.SUSG.toLowerCase())?.value ?? 0

  const balanceUsd = getSUSGAmount(susg) * getSUSGUnitPriceUsd(susg)

  // The dapp does not track the amount initially deposited: the position is valued at the current balance
  return { apy, amount: getSUSGAmount(susg), depositedUsd: balanceUsd, balanceUsd }
}

const getSUSGAmount = (susg: NonNullable<DashboardSources["susg"]>) => Number(formatEther(susg.sUSGBalance))

// 1 sUSG = sUSGPrice USG, 1 USG = USGPrice USD
const getSUSGUnitPriceUsd = (susg: NonNullable<DashboardSources["susg"]>) => Number(formatEther(susg.sUSGPrice)) * Number(formatEther(susg.USGPrice))

// ---------------------------
// WHOLE DASHBOARD
// ---------------------------
export const buildUserDashboardData = (address: string, sources: DashboardSources): UserDashboardData => ({
  address,
  usgPrice: sources.markets ? Number(formatEther(sources.markets.USGPrice)) : 1,
  borrowPositions: toBorrowPositions(sources),
  // The dapp has no source for the LPs staked by a wallet yet, see README.md
  curveLPPositions: [],
  susgPosition: toSUSGPosition(sources),
})

// Dashboard of a visitor without wallet (or a wallet with nothing): zeros and empty lists
export const EMPTY_USER_DASHBOARD: UserDashboardData = buildUserDashboardData("", {
  markets: undefined,
  claims: [],
  marketAprs: [],
  susg: undefined,
  savingsApys: [],
})
