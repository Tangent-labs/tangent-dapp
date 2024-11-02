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
