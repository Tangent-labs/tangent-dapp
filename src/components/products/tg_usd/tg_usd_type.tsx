import { AprEntry, AssetData, AssetDataPriced, ERC20StaticInfos, ExistingAsset, Network, TokenAmountPriced } from "@/types"
import { Address } from "viem"

export type TgUsdGlobalMarketData = {
  tgUsdPrice: number
  tgUsdsupply: number
  sgUsdprice: number
  sgUsdsupply: number
  globalCr: number
  GlobalTvl: number
}

export type TgUsdCampaignData = {
  debts: number
  deposists: number
  totalPoints: number
}

export type MarketPlatforms = "convex" | "curve"

export type TgUsdMarketData = {
  network: Network
  platforms: MarketPlatforms[]
  collateral: ExistingAsset
  apr: AprEntry
  borrowRate: number
  tvl: number
  borrowed: number
  cap: number
  marketAddress: Address
}

export type TgUSDTokenAmount = {
  token: string
  symbol: ExistingAsset
  amount: bigint
}

export type HarvesterInfo = {
  collateralName: string
  harvesterFeePercentage: bigint
  marketAddress: string
  tokenAmounts: TgUSDTokenAmount[]
  lastHarvestDate: bigint
}

export type TgUsdMarketDataUser = {
  debt: number
  health: number
}

export type TgUsdAirdropData = {
  debts: number
  deposists: number
  totalPoints: number
}

export type TgUsdGlobalData = {
  tgUsdPrice: string // $
  tgUsdSupply: string
  sgUsdPrice: string // $
  sgUsdSupply: string
  APY: string // %
  globalCr: string // %
  globalTvl: string // $
}

export type TgUsdMarketType = "Convex_CRV" | "Convex_FXN"

export type TgUsdMarket = {
  marketAddress: Address
  marketName: ExistingAsset
  collatAddress: Address
  marketType: TgUsdMarketType
}

export type ClaimerInfoDisplay = {
  asset: ExistingAsset // Address
  stakingAddress: Address
  rewards: TokenAmountPriced
  isProcessed: boolean
  percentage: number
  harvesterFees: number
}

export type CollatStaked = {
  amount: bigint
  decimals: bigint
  symbol: ExistingAsset
  token: Address
}

export type ClaimerInfo = {
  marketAddress: Address
  collatStakedUsdValue: bigint
  collatStaked: CollatStaked
  claimableTokens: CollatStaked[]
}

export type ClaimAsset = {
  amount: string
  valueInUsd: string
  symbol: ExistingAsset
}

export type ClaimData = {
  marketAddress: Address
  marketName: ExistingAsset
  claimable: ClaimAsset[]
  totalClaimableValue: string
  deposited: ClaimAsset
  totalDepositedValue: string
}

export type ClaimableMarket = {
  marketName: ExistingAsset
  marketAddress: Address
  claimable: string
}

export interface ChainViewMarketRow {
  marketAddress: string
  collateralInfos: CollateralInfos
  debtInfos: DebtInfos
  constants: MarketConstants
  obas: OutputBalanceAllowances[]
  rewardTokens: ERC20StaticInfos[]
}

export interface CollateralInfos {
  collateralToken: ERC20StaticInfos
  totalCollateralUSDValue: string
  totalCollateralAmount: string
  collateralUSDPrice: string
  positionCollateralAmount: string
  positionCollateralUSDValue: string
  priceOracle: string
}

export interface DebtInfos {
  totalDebt: string
  positionDebt: string
  healthRatio: string
  currentBorrowRate: string
  futureBorrowRate: string
  currentRewardCut: string
  futureRewardCut: string
}

export interface MarketConstants {
  maxLTV: string
  maxMarketDebt: string
  minimumLoan: string
  liquidationThreshold: string
}

export interface OutputBalanceAllowances {
  token: string // Address of the token
  balance: string
  allowances: Allowance[]
}

export interface Allowance {
  spender: string // Address of the spender
  allowance: string
}

export type ChainViewMarketList = {
  tgUSDPrice: bigint // uint256
  tgUSDSupply: bigint // uint256
  sgUSDPrice: bigint // uint256
  sgUSDSupply: bigint // uint256
  tgUSDPercentageInSgUSD: bigint // uint256
  rowInfos: ChainViewMarketRow[]
}

export type MarketDetailData = {
  marketAddress: Address
  collateralInfo: AssetDataPriced
  debtInfos: DebtInfos
  constants: MarketConstants
  collateralBalance: bigint
  collateralAllowance: bigint
  collateralInfos: CollateralInfos
  marketType?: TgUsdMarketType
}

export type TgUsdtMarketDepositParams = TgUsdtMarketBorrowParams & {
  isStaking: boolean
  isDepositAndBorrow: boolean
  depositWeiValue: bigint
}

export type TgUsdtMarketBorrowParams = {
  borrowWeiValue?: bigint
  marketAddress: Address
}

export type TgUsdtMarketWitrhdrawParams = {
  withdrawWeiValue?: bigint
  marketAddress: Address
}

export type TgUsdtMarketLiquidateParams = {
  liquidateWeiValue?: bigint
  marketAddress: Address
}

export type TgUsdtMarketRepayParams = {
  repayWeiValue?: bigint
  marketAddress: Address
}

export type TgUsdMarketLoanDisplayData = {
  collateralValue: string
  debt: string
  health: string
  ltv: string
  maxBorrowable: string
  maxWithdrawable: string
}

export type TgUsdMarketDisplayData = TgUsdMarketLoanDisplayData & {
  tvl: string
  tvlDollar: string
  borrowed: string
  borrowRateCurrent: string
  borrowRateNext: string
  cap: string
  maxLtv: string
  maxLtvDollar: string
  rewardsCutCurrent: string
  rewardsCutNext: string
  lt: string
  ltDollar: string
}

export type TgUsdMarketAmounts = {
  depositWeiValue?: bigint
  borrowWeiValue?: bigint
  withdrawWeiValue?: bigint
  repayWeiValue?: bigint
}

export type ZapperData = {
  amountOut: bigint
}

export type ZapToken = AssetData & {
  chainId?: number
  logoURI: string
  price: number
}

export type BalanceAllowanceData = {
  token: Address
  balance: bigint
  allowances: Array<{ spender: Address; allowance: bigint }>
}

export type ZapMarketData = {
  amountIn: bigint
  market: Address
  minAmountOut: bigint
  tokenIn: Address
  _for: Address
}
