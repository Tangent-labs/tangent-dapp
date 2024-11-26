import { Address } from "viem"

export type TokenAmount = {
  token: string
  amount: bigint
}

export type AprDetails = {
  [key: string]: number | string | undefined
}

export type AprEntry = {
  details: AprDetails
  totalApr: number
}

export type AprData = {
  [address: Address]: AprEntry
}

export type Apr = {
  actualsApr: AprData
  projectedApr: AprData
  boostsData: Record<string, unknown>
}

export type AssetApr = {
  actualsApr?: AprEntry
  projectedApr?: AprEntry
  boostsData?: unknown
}

export type AprDisplay = {
  title: string
  total: string
  details: {
    asset: string
    value: string
    percent: number
  }[]
}

export type PositionData = {
  tokenId: number
  deposited: bigint
  tokensClaimable: TokenAmount[]
}

export type BalanceAllowances = {
  token: Address
  balance: bigint
  allowances?: Allowance[]
}

export type Allowance = {
  spender: Address
  allowance: bigint
}
