import { AprEntry, ExistingAsset, Network } from "@/types"
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
