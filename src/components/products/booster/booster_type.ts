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

export type BoosterDetail = {
  totalStaked: bigint
  userStaked: bigint
  tokensClaimable: TokenAmount[]
  positionsDetails: PositionData[]
  isProcessed: boolean
}

export type BoosterDetailOut = {
  boosterDetail: BoosterDetail
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
  asset?: AssetDataPriced
}

export type BoosterGaugeParams = {
  walletClient: WalletClient
  tokenId: number
  stakingInfo: BoosterStakingInfo
  weiValue: bigint
}

export type BoosterDepositParams = BoosterGaugeParams & {
  current: BoosterDepositType
  expectedSdAsset: bigint
  isLock: boolean
}

export type ConvertAndStakeSdAssetParams = [
  _tokenId: number, // uint256 is mapped to bigint in TS
  _sdAssetStaking: string, // address is mapped to string
  _gaugeAssetAmount: bigint,
  _minSdAssetAmountReceivedDuringSwap: bigint,
  _sdAssetAmount: bigint,
  _assetAmount: bigint,
  isLock: boolean,
]

export type BoosterConvertOut = {
  sdAssetAmountOut: bigint
  feePercentage: bigint
  feeOrIncentiveAmount: bigint
}
