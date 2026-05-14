import { Address } from "viem"

export type AssetData = {
  address: Address
  decimals: number
  displayDecimals: number
  symbol: string
  name?: string
  logoKey?: string
  balance?: bigint
  displaySymbol?: string
}

export type AssetDataPriced = AssetData & {
  price: number
}

export type CollateralInfo = {
  address: Address
  decimals: number
  displayDecimals: number
  symbol: string
  name: string
  logoKey: string
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
  rawAmount: string
  logoKey?: string
  tokenAmountFormatted?: string
}

export type TokenAmountData = {
  dollarValue: string | undefined
  tokenAmount: string | undefined
}

export type TokenAmountPriced = {
  totalDollar: number
  details: TokenAmountPricedRow[]
}

export type AssetPrices = { [tokenAddress: Address]: number }
