import { AssetDataPriced, AssetUserData, ExistingAsset, FormState, SelectOption, TokenizedPosition } from "@/types"
import { Address } from "viem"

export type ExampleFormInitData = {
  assetList: ExampleFormAssetData[]
  contract: ExampleFormContractData
}
export type ExampleFormContractData = {
  name: string
  address: Address
}

export type ExampleFormAssetType = "asset" | "sdAsset" | "gaugeAsset"

/**
 * Specific asset type for this form
 * each asset have to be specified as  "asset" | "sdAsset" | "gaugeAsset"
 */
export type ExampleFormAssetData = AssetDataPriced & {
  assetType: ExampleFormAssetType
  approveContract?: Address
}

/**
 * All the values that are collected on the Form
 */
export type ExampleFormValues = {
  assetIn: ExampleFormAssetType
  value: bigint
  selectedPosition?: string
}

/**
 * All the toogle on the screen that are not data related
 *  for example: pro mode
 */
export type ExampleFormOption = {
  showPosition: boolean
}

/**
 * Custom Asset option for the select asset
 * Here bcause the selected value is "asset" | "sdAsset" | "gaugeAsset" and
 * not the symbol of the asset
 */
export type ExampleFormAssetOption = {
  options: ExistingAsset[]
  optionValues: Record<string, string>
}

/***
 * Data from the chain View
 */
export type ExampleFormChainViewData = {
  erc20Data: [AssetUserData, AssetUserData, AssetUserData]
  userData: {
    positions: TokenizedPosition[]
  }
}

/**
 * Transformed Data form the chain View data.
 */
export type ExampleFormSetUpData = {
  positionsOptions: SelectOption[]
  assets: Record<ExampleFormAssetType, AssetUserData>
}

/**
 * What is exposed by the context
 */
export type ExampleFormContextValue = {
  isLoading: boolean
  formState: FormState
  currentAsset?: AssetDataPriced & (AssetUserData | undefined)
  setUpData?: ExampleFormSetUpData
  assetOptions: ExampleFormAssetOption
  formValues: ExampleFormValues
  updateFormValues: (field: FormExampleValueField, value: ExampleFormValueTypes) => void
  actionDeposit: () => void
  actionApprove: () => void
}

/**
 * Helper for the updateFormValues method
 */
export type FormExampleValueField = keyof ExampleFormValues
export type ExampleFormValueTypes = ExampleFormValues[FormExampleValueField]
