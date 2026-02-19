"use client"

import { cn, PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"
import { formatUnits, parseUnits } from "viem"
import BorderPanel from "../structure/border_panel"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { IconThunder, IconWallet } from "@/components/icons"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatBigInt, formatDollar, truncateTo6Decimals } from "@/lib/number_formatter"
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
  maxAmountParams,
  sliderParams,

  ...props
}: GenericInputAssetAmountProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const sliderDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ---------------------------
  // SLIDER PARAMS INITIALIZATION
  // Determines whether the slider is displayed and its initial values
  // ---------------------------

  let isSliderDisplay = false
  let setSliderPercentage: (value: number) => void
  let sliderPercentage = 0
  let sliderLegendValues: string[] = []
  let sliderStartEndRange: [string, string, string] = ["0", "100", "1"]
  let sliderUnit = "%"

  if (sliderParams) {
    isSliderDisplay = true
    setSliderPercentage = sliderParams.setSliderPercentage
    sliderPercentage = sliderParams.sliderPercentage
    sliderLegendValues = sliderParams.sliderLegendValues ? sliderParams.sliderLegendValues : PERCENTAGE_INPUT_AMOUNT
    sliderStartEndRange = sliderParams.startEndRange ? sliderParams.startEndRange : sliderStartEndRange
    sliderUnit = sliderParams.unit ? sliderParams.unit : "%"
  }

  // ---------------------------
  // MAX BUTTON PARAMS INITIALIZATION
  // Determines whether the max button is displayed and its values
  // ---------------------------

  let isMaxButtonDisplay = false
  let maxWeiValue = 0n
  let setMaxAmount: () => void
  if (maxAmountParams) {
    isMaxButtonDisplay = true
    maxWeiValue = maxAmountParams.maxWeiValue
    setMaxAmount = maxAmountParams.setMaxAmount
  }

  const decimals = asset?.decimals ?? 18

  // State for the input field displayed value as a human-readable string
  const [localDisplay, setLocalDisplay] = useState(() => (inputWeiValue !== undefined ? formatUnits(inputWeiValue, decimals) : ""))

  // ---------------------------
  // SYNC WITH PARENT VALUE
  // Updates local input display when parent value changes
  // ---------------------------
  useEffect(() => {
    if (inputWeiValue === undefined) {
      setLocalDisplay("")
      return
    }

    if (document.activeElement !== inputRef.current) {
      setLocalDisplay(truncateTo6Decimals(formatUnits(inputWeiValue, decimals)))
    }
  }, [inputWeiValue, decimals])

  // ---------------------------
  // SYNC SLIDER WITH INPUT
  // Updates the slider percentage based on the input value
  // ---------------------------

  useEffect(() => {
    if (!sliderParams) return
    if (!maxWeiValue || maxWeiValue === 0n) return
    if (inputWeiValue === undefined) {
      setSliderPercentage(0)
      return
    }

    const percentage = Number((inputWeiValue * 100n) / maxWeiValue)

    setSliderPercentage(Math.min(100, Math.max(0, percentage)))
  }, [inputWeiValue, maxWeiValue])

  // ---------------------------
  // DOLLAR VALUE DISPLAY
  // Calculates the USD equivalent of the current input value
  // ---------------------------
  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(inputWeiValue || BigInt(0), asset?.decimals || 18)) * (asset?.price || 0)
    return `(${formatDollar(val)})`
  }, [inputWeiValue, asset])

  // ---------------------------
  // HANDLE INPUT CHANGE
  // Updates local display and calls parent callback with debounce
  // ---------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(",", ".").trim()

    // Allow empty string or valid numeric input
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setLocalDisplay(val)

      // Debounce updates to parent to avoid too many renders
      if (sliderDebounceRef.current) clearTimeout(sliderDebounceRef.current)

      sliderDebounceRef.current = setTimeout(() => {
        if (val === "") {
          onValueChange?.(undefined)
        } else {
          try {
            const wei = parseUnits(val, decimals)
            onValueChange?.(wei)
          } catch (err) {
            console.warn("Invalid amount", val)
          }
        }
      }, 400)
    }
  }

  // ---------------------------
  // HANDLE SLIDER CHANGE
  // Updates input value and calls parent callback when slider moves
  // ---------------------------
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = Number(e.target.value)

    // Immediate visual update
    setSliderPercentage(percentage)

    // Cancel previous debounce
    if (sliderDebounceRef.current) {
      clearTimeout(sliderDebounceRef.current)
    }

    sliderDebounceRef.current = setTimeout(() => {
      if (percentage === 100 && maxWeiValue > 0n) {
        onValueChange?.(maxWeiValue)
        return
      }

      if (maxWeiValue === 0n) {
        onValueChange?.(undefined)
        return
      }

      const wei = (BigInt(Math.round(percentage)) * maxWeiValue) / 100n
      onValueChange?.(wei)

      setLocalDisplay(truncateTo6Decimals(formatUnits(wei, decimals)))
    }, 300) // <= delay here
  }

  // ---------------------------
  // HANDLE MAX BUTTON CLICK
  // Sets input to max value and slider to 100%
  // ---------------------------
  const handleMaxClick = () => {
    setMaxAmount()
    setSliderPercentage(100)
    setLocalDisplay(truncateTo6Decimals(formatUnits(maxWeiValue, decimals)))
  }

  // ---------------------------
  // HANDLE PANEL CLICK
  // Focuses input when clicking on the panel except for interactive elements
  // ---------------------------
  const handlePanelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement

    // Prevent to get focus whend clicked on interractive element in the input
    if (target.closest(".stop-focus")) return

    inputRef.current?.focus()
  }

  return (
    <BorderPanel
      className={cn(
        isLoading ? "shimmer" : "",
        disabled
          ? "bg-panel-disabled"
          : "cursor-text bg-white bg-opacity-[3%] ease-out focus-within:border-[--tgt-button-active] hover:bg-white/[0.08] hover:shadow-lg [&:has(.no-parent-hover:hover)]:!bg-white/[0.03] [&:has(.no-parent-hover:hover)]:!shadow-none",
        "flex flex-col p-2 transition-all duration-200"
      )}
      onClick={handlePanelClick}
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
          <div className="relative inline-block w-full max-w-[250px]">
            <input
              {...props}
              lang="en"
              disabled={isLoading || disabled}
              type="text"
              value={localDisplay}
              placeholder="0.00"
              onChange={handleInputChange}
              className={cn(
                "auto-grow", // ta classe (supposée field-sizing: content ou JS)
                "block w-full", // ou inline-block si tu préfères
                "bg-transparent text-left text-[24px] font-semibold",
                "placeholder:text-left placeholder:text-gray-400",
                "focus:outline-none",
                "min-w-[80px]", // taille mini au départ
                "max-w-full", // ← important : max-w-full sur l'input lui-même
                "truncate" // coupe visuellement si overflow (fallback)
              )}
              ref={inputRef}
              step="any"
              inputMode="decimal"
            />
          </div>

          <div className="text-xs text-subtitle">{dollarDepositDisplay}</div>
        </div>

        <div className="stop-focus flex items-center justify-center gap-2">
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
        {isMaxButtonDisplay && <MaxButton className="stop-focus" onClick={() => handleMaxClick()} />}
      </div>

      {bottomPart}
    </BorderPanel>
  )
}
