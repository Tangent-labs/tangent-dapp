import { Abi, Address } from "viem"
import { ExistingAsset } from "./type_tokens"

export type TokenAmount = {
  token: string
  amount: bigint
}

export type TokenAmountDollar = TokenAmount & {
  dollarValue: number
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

export type ERC20StaticInfos = {
  token: string // Address of the token (IERC20Metadata)
  decimals: number // Number of decimals for the token
  symbol: string // Symbol of the token
}

export type BalanceAllowances = {
  token: Address
  balance: bigint
  allowances?: Allowance[]
}
export type OutputBalanceAllowances = BalanceAllowances
export type Allowance = {
  spender: Address
  allowance: bigint
}

export type HarvestRow = {
  asset: ExistingAsset
  harvesterFees: number
  totalHarvest: number
  details: TokenAmountDollar[]
}

export type TxContractCallData = {
  abi: Abi
  functionName: string
  args: unknown[]
  address: Address
  account?: Address
  gas?: bigint
}

export type Network = "mainnet"
