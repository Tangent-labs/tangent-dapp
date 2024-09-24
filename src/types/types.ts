import { ExistingAsset } from "./type_tokens"

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
