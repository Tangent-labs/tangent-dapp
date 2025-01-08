import { AprEntry, ExistingAsset, Network, TokenAmountPriced } from "@/types"
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
  tgUsdPrice: number // $
  tgUsdsupply: number
  sgUsdprice: number // $
  sgUsdsupply: number
  APY: number // %
  globalCr: number // %
  GlobalTvl: number // $
}

export type TgUsdMarket = {
  marketAddress: Address
  marketName: string
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
  claimable: string
}
