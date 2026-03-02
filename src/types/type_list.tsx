import { Address } from "viem"
import { ExistingAsset } from "."

export type SortedState = "asc" | "desc" | "none"

export type ListSort = {
  key: string
  direction: SortedState
}

export type ListState = {
  sort?: ListSort
  search?: string
}

export type ListHeaderData = {
  label?: string
  key: string
  indicator?: string
  sort?: null | string
}

export type ListRowData = {
  token: ExistingAsset
  name: string
  address: Address
  apr: {
    current?: number
    projected?: number
  }
  maxLTV: number
  maxBorrowable: string
  currentAPRDetails: {
    [rewardToken: string]: number
  }
  projectedAPRDetails: {
    [rewardToken: string]: number
  }

  indicators: {
    key: string
    label: string
    value: string
    raw?: number // Raw numerical value for calculations
  }[]
  userHasDeposited: boolean
  positionCollateralAmount: string
  totalCollateralAmount: string
  protocol: string
  type: string
  rewardToken: string
}
