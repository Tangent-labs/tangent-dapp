import { Address } from "viem"
import { AssetDataPriced } from "@/types"

export type TANStakingInfo = {
  sTanBalance: bigint
  sTanPrice: bigint
  sTanSupply: bigint
  tanAllowance: bigint
  tanBalance: bigint
  tanPercentageInsTan: bigint
  tanPrice: bigint
}

export type StakingDepositType = "asset" | "sdAsset"

export type StakingAssetInfo = {
  balance: bigint | undefined
  address: Address
  current: StakingDepositType
  asset?: AssetDataPriced
}
