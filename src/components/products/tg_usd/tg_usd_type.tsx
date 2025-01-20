import { AprEntry, AssetDataPriced, ExistingAsset, Network } from "@/types"
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
  marketName: ExistingAsset
  collatAddress: Address
  marketType: "Convex_CRV" | "Convex_FXN"
}

export type StakingInfo = {
  sgUSDBalance: bigint
  sgUSDPrice: bigint
  sgUSDSupply: bigint
  tgUSDAllowance: bigint
  tgUSDBalance: bigint
  tgUSDPercentageInSgUSD: bigint
  tgUSDPrice: bigint
  tgUSDSupply: bigint
}

export type StakingDepositType = "asset" | "sdAsset"

export type StakingAssetInfo = {
  balance: bigint | undefined
  address: Address
  current: StakingDepositType
  asset?: AssetDataPriced
}
