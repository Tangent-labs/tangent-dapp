import { AssetDataPriced } from "@/types"
import { Address } from "viem"

export type StakingInfo = {
  sTanBalance: bigint
  sTanPrice: bigint
  sTanSupply: bigint
  tanAllowance: bigint
  tanBalance: bigint
  tanPercentageInsTan: bigint
  tanPrice: bigint
  tanSupply: bigint
}

export type StakingDepositType = "asset" | "sdAsset"

export type StakingAssetInfo = {
  balance: bigint | undefined
  address: Address
  current: StakingDepositType
  asset?: AssetDataPriced
}
