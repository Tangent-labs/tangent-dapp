import { AssetApr, AssetDataPriced, ExistingAsset, TokenAmount } from "@/types"
import { Address } from "viem"

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

export type BoosterRowExtend = BoosterRow & {
  info: BoosterStakingInfo
  apr: AssetApr
  tokenInfo: AssetDataPriced
}

export type BoosterStakingInfo = {
  stakingAddress: Address
  asset: Address
  sdAsset: Address
  gaugeAsset: Address
  pool?: Address
  rewards?: Address[]
}

export type BoosterStakingInfos = Record<BoosterExistingAsset, BoosterStakingInfo>
