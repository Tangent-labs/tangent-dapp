import { AssetDataPriced } from "@/types"
import { Address } from "viem"

export type StakingInfo = {
  sTANBalance: bigint
  sTANPrice: bigint
  sTANSupply: bigint
  TANAllowance: bigint
  TANBalance: bigint
  TANPercentageInsTAN: bigint
  TANPrice: bigint
  TANSupply: bigint
}

export type StakingDepositType = "asset" | "sdAsset"

export type StakingAssetInfo = {
  balance: bigint | undefined
  address: Address
  current: StakingDepositType
  asset?: AssetDataPriced
}
