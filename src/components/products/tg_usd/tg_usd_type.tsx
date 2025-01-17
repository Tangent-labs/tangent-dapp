import { AprEntry, ERC20StaticInfos, ExistingAsset, Network, TokenAmountPriced } from "@/types"
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

export type TgUsdMarket = {
  marketAddress: Address
  marketName: ExistingAsset
  collatAddress: Address
  marketType: "Convex_CRV" | "Convex_FXN"
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
  totalCollateralUSDValue: string // Value in string format to handle large numbers
  totalCollateralAmount: string // Value in string format
  collateralUSDPrice: string // Value in string format
  positionCollateralAmount: string // Value in string format
  positionCollateralUSDValue: string // Value in string format
  priceOracle: string
}

export interface DebtInfos {
  totalDebt: string // Value in string format
  positionDebt: string // Value in string format
  healthRatio: string // Value in string format for maximum precision
  actualBorrowRate: string // Value in string format
  nextBorrowRate: string // Value in string format
}

export interface MarketConstants {
  maxLTV: string // Value in string format
  maxMarketDebt: string // Value in string format
  minimumLoan: string // Value in string format
}

export interface OutputBalanceAllowances {
  token: string // Address of the token
  balance: string // Value in string format
  allowances: Allowance[]
}

export interface Allowance {
  spender: string // Address of the spender
  allowance: string // Value in string format
}

export type ChainViewMarketList = {
  tgUSDPrice: bigint // uint256
  tgUSDSupply: bigint // uint256
  sgUSDPrice: bigint // uint256
  sgUSDSupply: bigint // uint256
  tgUSDPercentageInSgUSD: bigint // uint256
  rowInfos: ChainViewMarketRow[]
}
