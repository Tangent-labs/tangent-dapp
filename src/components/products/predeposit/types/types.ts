import { Address } from "viem"

export type PredepositStatus = {
  predepositState: string
  userState: string
  isSigned: boolean

  USGUSDCData: {
    USGUSDCAccumulatedBalance: bigint
    USGUSDCAccumulatedTotal: bigint
    USGUSDCCap: bigint
    lpName: string
    name: string
    address: Address
    decimals: number
  }

  USGfrxUSDData: {
    USGfrxUSDAccumulatedBalance: bigint
    USGfrxUSDAccumulatedTotal: bigint
    USGfrxUSDCap: bigint
    lpName: string
    name: string
    address: Address
    decimals: number
  }
}

export type PoolLiquidity = {
  usdTotal: number
  coins: Array<{ symbol: string; usdValue: number }>
}

export type CurvePoolApiEntry = {
  address: string
  usdTotal: number
  coins: Array<{
    address: string
    symbol: string
    decimals: string | number
    usdPrice: number
    poolBalance: string
  }>
}

export type PredepositRawState = {
  predepositState: string
  userState: string
  isSigned: boolean
  lpData: Array<{
    accumulatedBalance: bigint
    accumulatedTotal: bigint
    cap: bigint
    lpName: string
    otherStable: {
      name: string
      address: Address
      decimals: number
    }
  }>
}
