import { Address } from "viem"
import { ExistingAsset } from "."
import { USGMarketType } from "@/components/products/usg/usg_type"

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
  marketType: USGMarketType
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
    subValue?: string
    raw?: string // Raw numerical value for calculations
  }[]
  userHasDeposited: boolean
  positionCollateralUSDValue: string
  totalCollateralUSDValue: string

  protocol: string
  type: string
  rewardToken: string
}
