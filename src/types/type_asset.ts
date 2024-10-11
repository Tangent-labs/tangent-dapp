import { Address } from "viem"
import { ExistingAsset } from "./type_tokens"

export type AssetData = {
  address: Address
  decimals: number
  displayDecimals: number
  symbol: string
  name?: string
  logo?: ExistingAsset
}

export type AssetDataPriced = AssetData & {
  price: number
}

export type TokenizedPosition = {
  tknId: number
  balance?: bigint
  claimable?: bigint
}

export type AssetUserData = {
  allowance?: bigint
  balance?: bigint
}

export type AssetValueData = {
  value?: bigint
  balance?: bigint
}
