import { ExistingAsset } from "./type_tokens"

export type SelectOption = {
  label: string
  value: string
}

export type SelectOptionAmount = SelectOption & {
  amountRaw: number
  amountDisplay: string
}

export type SelectAssetLogoOption = SelectOption & {
  logo: ExistingAsset
}
