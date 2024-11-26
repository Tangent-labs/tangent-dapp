import { Address } from "viem"
import { ExistingAsset } from "@/types/type_tokens"

export type AssetData = {
  address: Address
  decimals: number
  displayDecimals: number
  symbol: string
  name?: string
  logo: ExistingAsset
  displaySymbol?: string
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

export type TokenAmountPricedRow = {
  symbol: string
  dollarValue: number
  tokenAmount: number
}

export type TokenAmountPriced = {
  totalDollar: number
  details: TokenAmountPricedRow[]
}
