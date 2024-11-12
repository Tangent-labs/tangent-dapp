import { AssetApr, AssetDataPriced, AssetUserData, BalanceAllowances, ExistingAsset, PositionData, TokenAmount } from "@/types"
import { Address, WalletClient } from "viem"

export type BoosterExistingAsset = Extract<ExistingAsset, "BAL" | "CRV" | "PENDLE" | "FXN">

export type BoosterRow = {
  totalStaked: bigint
  userStaked: bigint
  tokensClaimable: TokenAmount[]
  isProcessed: boolean
}

export type OutputBoosterList = {
  crvRow: BoosterRow
  balRow: BoosterRow
  pendleRow: BoosterRow
  fxnRow: BoosterRow
}

export type BoosterDetailOut = {
  totalStaked: bigint
  userStaked: bigint
  tokensClaimable: TokenAmount[]
  positionsDetails: PositionData[]
  isProcessed: boolean
  obas: BalanceAllowances[]
}

export type BoosterRowExtend = BoosterRow & {
  info: BoosterStakingInfo
  apr: AssetApr
  tokenInfo: AssetDataPriced
}

export type BoosterStakingInfo = {
  stakingAddress: Address
  asset: ExistingAsset
  sdAsset: ExistingAsset
  gaugeAsset: Address
  pool?: Address
  rewards?: ExistingAsset[]
}

export type BoosterDepositType = "asset" | "sdAsset" | "gaugeAsset"

export type BoosterStakingInfos = Record<BoosterExistingAsset, BoosterStakingInfo>

export type BoosterDepositAssetInfo = {
  balance: AssetUserData
  address: Address
  current: BoosterDepositType
}

export type BoosterDepositParams = {
  walletClient: WalletClient
  tokenId: number
  stakingInfo: BoosterStakingInfo
  currentAsset: BoosterDepositAssetInfo
  splippage: number
  weiValue: bigint
  isLock: boolean
}
