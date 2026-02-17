"use client"

import { cn, PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"
import { formatUnits } from "viem"
import BorderPanel from "../structure/border_panel"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { IconThunder, IconWallet } from "@/components/icons"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatBigInt, formatDisplayValue, formatDollar, toBigInt } from "@/lib/number_formatter"
import { SliderInput } from "./SliderInput"
import MaxButton from "./MaxButton"

type SliderParams = {
  sliderPercentage: number
  setSliderPercentage: (value: number) => void
  sliderLegendValues?: string[]
  startEndRange?: [string, string, string]
  unit?: "%" | "x"
}

type MaxAmount = {
  maxWeiValue: bigint
  setMaxAmount: () => void
}
type GenericInputAssetAmountProps = React.InputHTMLAttributes<HTMLInputElement> & {
  disabled?: boolean
  inputWeiValue?: bigint
  onValueChange?: (value: bigint | undefined) => void
  asset?: AssetDataPriced | CollateralInfo
  label: string | ReactNode
  depositSelect: ReactNode
  isZapping?: boolean
  isLoading?: boolean

  displayBalance?: boolean

  bottomPart?: ReactNode
  maxAmountParams?: MaxAmount
  sliderParams?: SliderParams
}

export function GenericInputAssetAmount({
  inputWeiValue,
  asset,
  label,
  onValueChange,
  depositSelect = <></>,
  isZapping = false,
  isLoading = false,
  displayBalance = false,
  bottomPart,
  disabled,

  ...props
}: GenericInputAssetAmountProps) {
  // STATE PARAMS
  const [inputNumberValue, setInputNumberValue] = useState<string>(inputWeiValue !== undefined ? formatUnits(inputWeiValue, asset?.decimals || 18) : "")
  const [isUserInput, setIsUserInput] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const sliderDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // SLIDER PARAMS

  let isSliderDisplay = false
  let setSliderPercentage: (value: number) => void
  let sliderPercentage = 0
  let sliderLegendValues: string[] = []
  let sliderStartEndRange: [string, string, string] = ["0", "100", "1"]
  let sliderUnit = "%"

  if (props.sliderParams) {
    const _sliderP = props.sliderParams

    isSliderDisplay = true
    setSliderPercentage = _sliderP.setSliderPercentage
    sliderPercentage = _sliderP.sliderPercentage
    sliderLegendValues = _sliderP.sliderLegendValues ? _sliderP.sliderLegendValues : PERCENTAGE_INPUT_AMOUNT
    sliderStartEndRange = _sliderP.startEndRange ? _sliderP.startEndRange : sliderStartEndRange
    sliderUnit = _sliderP.unit ? _sliderP.unit : "%"
  }

  // MAX BUTTON PARAMS

  let isMaxButtonDisplay = false
  let maxWeiValue = 0n
  let setMaxAmount: () => void
  if (props.maxAmountParams) {
    isMaxButtonDisplay = true
    maxWeiValue = props.maxAmountParams.maxWeiValue
    setMaxAmount = props.maxAmountParams.setMaxAmount
  }

  /**
   *
   */
  useEffect(() => {
    if (inputWeiValue !== undefined) {
      const decimals = asset?.decimals || 18
      const updatedValue = formatUnits(inputWeiValue, decimals)
      setInputNumberValue(updatedValue)
      setIsUserInput(false)
    }
  }, [inputWeiValue, asset])

  useEffect(() => {
    if (!asset?.decimals || !isUserInput) return

    const handler = setTimeout(() => {
      const val = inputNumberValue ? toBigInt(Number(inputNumberValue), asset.decimals) : undefined
      if (onValueChange) {
        onValueChange(val)
      }
    }, 500)

    return () => clearTimeout(handler)
  }, [inputNumberValue, asset, isUserInput, onValueChange])

  /**
   * Format the balance amount of the active asset
   * Updated when asset or balance is changed
   */
  const maxNumber = useMemo(() => {
    if (maxWeiValue) {
      return Number(formatUnits(maxWeiValue, asset?.decimals || 18))
    }
    return 0
  }, [maxWeiValue, asset])

  /**
   * Updated when input or asset changes
   */
  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(inputWeiValue || BigInt(0), asset?.decimals || 0)) * (asset?.price || 0)
    return `(${formatDollar(val)})`
  }, [inputWeiValue, asset])

  /**
   * Triggered on the user input with keyboard
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(",", ".")

    if (newValue === "" || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      setInputNumberValue(newValue)
      if (!!setSliderPercentage) {
        setSliderPercentage(newValue !== "" && maxNumber > 0 ? (Number(newValue) / maxNumber) * 100 : 0)
      }
    }
    setIsUserInput(true)
  }

  /**
   * Triggered with the slider
   */
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setSliderPercentage) return

    const newPercentage = Number(e.target.value)
    setSliderPercentage(newPercentage)

    if (sliderDebounceRef.current) {
      clearTimeout(sliderDebounceRef.current)
    }

    sliderDebounceRef.current = setTimeout(() => {
      const newValue =
        newPercentage === Number(sliderStartEndRange[1]) ? maxNumber : Number(((newPercentage / Number(sliderStartEndRange[1])) * maxNumber).toFixed(0))

      setInputNumberValue(formatDisplayValue(newValue))
      if (onValueChange) {
        onValueChange(!!newValue ? toBigInt(newValue, asset?.decimals || 18) : undefined)
      }
    }, 300)
  }

  const onClickFocus = () => {
    inputRef.current?.focus()
  }

  return (
    <BorderPanel
      className={cn(
        isLoading ? "shimmer" : "",
        disabled
          ? "bg-panel-disabled"
          : "cursor-text bg-white bg-opacity-[3%] hover:bg-white/[0.08] hover:shadow-lg [&:has(.no-parent-hover:hover)]:!bg-white/[0.03] [&:has(.no-parent-hover:hover)]:!shadow-none",
        "flex flex-col p-2 transition-all duration-200"
      )}
      onClick={onClickFocus}
    >
      {displayBalance ? (
        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-subtitle">{label}</div>
          <div className="flex items-center justify-center gap-1 text-xs text-subtitle">
            {formatBigInt(maxWeiValue, asset?.decimals || 18, 2)}
            <IconWallet className="w-3"></IconWallet>
          </div>
        </div>
      ) : (
        <div className="text-sm text-subtitle">{label}</div>
      )}

      <div className="flex justify-between">
        <div className="flex items-center justify-start">
          <input
            {...props}
            lang="en"
            disabled={isLoading || disabled}
            type="text"
            value={inputNumberValue}
            placeholder="Amount"
            onChange={handleInputChange}
            className="auto-grow bg-transparent text-[24px] font-semibold focus:outline-none"
            ref={inputRef}
            step="any"
            inputMode="decimal"
          />

          <div className="text-xs text-subtitle">{dollarDepositDisplay}</div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-1">{isZapping && <IconThunder className="h-auto w-[8px] text-row-tonic" />}</div>
          <div className="no-parent-hover order-1 rounded-md lg:order-2">{depositSelect}</div>
        </div>
      </div>

      <div className="flex w-full items-center gap-2">
        {isSliderDisplay && (
          <div className="group flex w-full flex-col">
            <SliderInput
              disabled={disabled}
              percentage={sliderPercentage}
              handleSliderChange={handleSliderChange}
              legendValues={sliderLegendValues}
              startEndRange={sliderStartEndRange}
              unit={sliderUnit as "%" | "x"}
            />
          </div>
        )}
        {isMaxButtonDisplay && (
          <MaxButton
            onClick={() => {
              setMaxAmount()
              setSliderPercentage(100)
            }}
          />
        )}
      </div>

      {bottomPart}
    </BorderPanel>
  )
}
