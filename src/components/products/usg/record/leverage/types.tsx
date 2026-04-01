import { AssetDataPriced, CollateralInfo } from "@/types"
import { ReactNode } from "react"
import { FormState } from "../../usg_type"

export type USGLeverageContextProps = {
  children: ReactNode
}

export type BuyAndMinOutFormatted = {
  expectedFormatted: string
  minOutFormatted: string
  expectedWei?: bigint
  minOutWei?: bigint
}

export type USGLeverageContextValues = {
  collateralInfo: AssetDataPriced

  isDepositDisabled: boolean
  setIsDepositDisabled: (arg: boolean) => void

  isLeverageAllPosition: boolean
  setIsLeverageAllPosition: (arg: boolean) => void

  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void
  actionApprove: () => void
  formState: FormState
  borrowWeiValue?: bigint
  setBorrowWeiValue: (arg: bigint | undefined) => void
  setDepositAsset: (arg: string) => void
  depositAsset: string | undefined

  isDepositLoading: boolean
  setIsDepositLoading: (arg: boolean) => void

  isZapLoading: boolean
  setIsZapLoading: (arg: boolean) => void

  isDumpUSGLoading: boolean
  setIsDumpUSGLoading: (arg: boolean) => void

  swapAssetPrice: number | null

  zapValue: bigint | undefined
  setZapValue: (arg: bigint) => void
  handleDepositChange: (arg: bigint | undefined) => void
  depositAssetInfo: AssetDataPriced | CollateralInfo

  slippage: number
  setSlippage: (arg: number) => void

  depositSliderPercent: number
  setDepositSliderPercent: (arg: number) => void

  leveragePercentage: number
  setLeveragePercentage: (arg: number) => void

  handleZapInputChange: (arg: bigint | undefined) => void

  actionLeverage: () => void

  actionZapLeverage: () => void

  leveragedCollateralQuote: bigint | undefined
  setLeveragedCollateralQuote: (arg: bigint) => void

  expectedCollateral: { sum: string; result: string }

  zapValuesFormatted: BuyAndMinOutFormatted
  usgDumpValuesFormatted: BuyAndMinOutFormatted
  swapValuesFormatted: BuyAndMinOutFormatted

  maxDepositString: string

  computedDepositAmount: bigint

  isZapping: boolean

  handleLeverageSliderChange: (arg: number) => void

  handleBorrowChange: (arg: bigint | undefined) => Promise<void>

  leverageRange: { sliderLegendValues: string[]; startEndRange: [string, string, string]; maxLeverageRaw: number; maxLeverageAdjusted: number }

  // aprVariation: { current: string; currentUpdated: string; projected: string; projectedUpdated: string }
  slippageLoss: { tokenLoss: string; dollarLoss: string }

  isTransactionBlockedBySlippage: boolean
  setIsTransactionBlockedBySlippage: (arg: boolean) => void

  priceImpactLoss: string

  priceImpact: number

  isTransactionBlockedByPriceImpact: boolean
  setIsTransactionBlockedByPriceImpact: (arg: boolean) => void

  leverageExceedsMaxLtv: boolean

  USGDumpPriceImpact: number

  USGDumpDollarLoss: number
}
