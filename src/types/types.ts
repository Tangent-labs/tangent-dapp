import { ExistingAsset } from "./type_tokens"

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
}

export type ListRowData = {
  token: ExistingAsset
  name: string
  apr: {
    current?: number
    projected?: number
  }
  assetsEarned: { token: ExistingAsset }[]
  indicators: {
    key: string
    label: string
    value: string // Display value, e.g., "2.5x veCRV"
    raw?: number // Raw numerical value for calculations
  }[]
}

export type IndicatorData = { title: string; value: string | number }
