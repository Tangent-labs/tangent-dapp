"use client"

import { MaxButton } from "./MaxButton"
import { SliderInput } from "./SliderInput"
import { formatUnits, parseUnits } from "viem"
import { BorderPanel } from "../structure/border_panel"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { cn, PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"
import { UI_V2 } from "@/v2/ui"
import { IconThunder, IconWallet } from "@/components/icons"
import { useAutoGrowInputWidth } from "@/hooks/useAutoGrowInputWidth"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatBigIntFloor, formatDollar } from "@/lib/number_formatter"

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
  slippageInput?: ReactNode

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
  slippageInput,

  ...props
}: GenericInputAssetAmountProps) {
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

  const { inputRef, inputSpanRef } = useAutoGrowInputWidth(localDisplay, {
    placeholder: "Amount",
    minPx: 32,
  })

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
      setLocalDisplay(formatBigIntFloor(inputWeiValue, decimals, asset?.displayDecimals || 2))
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
      setSliderPercentage(Number(sliderStartEndRange[0]))
      return
    }
    const percentage = (Number(inputWeiValue) / Number(maxWeiValue)) * 100
    setSliderPercentage(Math.min(Number(sliderStartEndRange[1]), Math.max(Number(sliderStartEndRange[0]), percentage)))
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
    const val = e.target.value.replace(",", ".").trim()

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
            // eslint-disable-next-line no-console
            console.warn("Invalid amount", val, err)
          }
        }
      }, 400)
    }
  }

  const handleBlur = () => {
    if (localDisplay && localDisplay !== ".") {
      const cleaned = localDisplay.replace(/^0+(\d)/, "$1")
      setLocalDisplay(cleaned)
    }
  }

  // ---------------------------
  // HANDLE SLIDER CHANGE
  // Updates input value and calls parent callback when slider moves
  // ---------------------------
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => applyPercentage(Number(e.target.value))

  const applyPercentage = (percentage: number) => {
    // Immediate visual update
    setSliderPercentage(percentage)

    // Cancel previous debounce
    if (sliderDebounceRef.current) {
      clearTimeout(sliderDebounceRef.current)
    }

    // When maxWeiValue is 0, the slider is externally controlled (e.g. leverage multiplier).
    // setSliderPercentage already handles the update, so skip the wei conversion.
    if (!maxWeiValue || maxWeiValue === 0n) return

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

      setLocalDisplay(formatBigIntFloor(wei, decimals, asset?.displayDecimals || 2))
    }, 300)
  }

  // ---------------------------
  // HANDLE MAX BUTTON CLICK
  // Sets input to max value and slider to 100%
  // ---------------------------
  const handleMaxClick = () => {
    if (sliderDebounceRef.current) clearTimeout(sliderDebounceRef.current)
    setMaxAmount()
    setSliderPercentage(Number(sliderStartEndRange[1]))
    // Do not treat this part for the leverage, it's externally controlled
    if (maxWeiValue !== 0n) {
      setLocalDisplay(formatBigIntFloor(maxWeiValue, decimals, asset?.displayDecimals || 2))
    }
  }

  // ---------------------------
  // HANDLE PANEL CLICK
  // Focuses input when clicking on the panel except for interactive elements
  // ---------------------------
  const handlePanelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest(".stop-focus")) return
    if (target.closest("[data-radix-popper-content-wrapper]")) return
    inputRef.current?.focus()
  }

  if (UI_V2) {
    // leverage drives this field with an external multiplier (unit "x"): keep the slider there, percentage chips everywhere else
    const isMultiplier = isSliderDisplay && sliderUnit === "x"
    return (
      <div
        onClick={handlePanelClick}
        className={cn(
          "flex flex-col rounded-xl border border-hairline p-4 transition-[border-color,opacity] duration-200",
          disabled ? "cursor-not-allowed opacity-45" : "cursor-text bg-white/[0.04] focus-within:border-white/20 hover:border-white/[0.12]",
          isLoading && "shimmer"
        )}
      >
        <div className="flex select-none items-center justify-between gap-2 text-xs text-ink-2">
          <span>{label}</span>
          {displayBalance ? (
            <span className="text-ink-3">Balance {formatBigIntFloor(maxWeiValue, asset?.decimals || 18, 2)}</span>
          ) : (
            slippageInput && <span className="stop-focus no-parent-hover">{slippageInput}</span>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <span ref={inputSpanRef} className="invisible absolute whitespace-pre text-[28px] font-light" aria-hidden="true" />
          <input
            {...props}
            lang="en"
            disabled={isLoading || disabled}
            type="text"
            value={isLoading ? "-" : localDisplay}
            placeholder="0.00"
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-full min-w-0 bg-transparent text-[28px] font-light tabular-nums tracking-[-0.02em] placeholder:text-ink-3 focus:outline-none disabled:cursor-not-allowed"
            ref={inputRef}
            step="any"
            inputMode="decimal"
          />
          <div className="stop-focus no-parent-hover flex shrink-0 items-center gap-2">
            {isZapping && <IconThunder className="h-auto w-[8px] text-action" />}
            {depositSelect}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="select-none text-xs tabular-nums text-ink-3">{isLoading ? "$-" : dollarDepositDisplay.slice(1, -1)}</span>
          {!isMultiplier && (isSliderDisplay || isMaxButtonDisplay) && (
            <span className="stop-focus flex gap-1.5 md:gap-1">
              {isSliderDisplay &&
                [25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    disabled={disabled}
                    onClick={() => applyPercentage(pct)}
                    className={cn(
                      "h-8 rounded-md px-3 text-[12px] transition-colors md:h-auto md:px-2 md:py-0.5 md:text-[11px]",
                      Math.round(sliderPercentage) === pct ? "bg-white/[0.12] text-white" : "bg-white/[0.07] text-ink-2 hover:text-white"
                    )}
                  >
                    {pct}%
                  </button>
                ))}
              {isMaxButtonDisplay && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleMaxClick}
                  className="h-8 rounded-md bg-white/[0.07] px-3 text-[12px] text-ink-2 transition-colors hover:text-white md:h-auto md:px-2 md:py-0.5 md:text-[11px]"
                >
                  Max
                </button>
              )}
            </span>
          )}
        </div>
        {isMultiplier && (
          <div className="stop-focus mt-3">
            <SliderInput
              disabled={disabled}
              value={sliderPercentage}
              handleSliderChange={handleSliderChange}
              legendValues={sliderLegendValues}
              startEndRange={sliderStartEndRange}
              unit={sliderUnit as "%" | "x"}
            />
          </div>
        )}
        {bottomPart}
      </div>
    )
  }

  return (
    <BorderPanel
      className={cn(
        isLoading ? "shimmer" : "",
        disabled
          ? "bg-panel-disabled"
          : cn(
              "cursor-text bg-white bg-opacity-[3%] ease-out",
              "focus-within:border-[--tgt-button-active] focus-within:shadow-[0_0_6px_1px_var(--tgt-button-active)]",
              "hover:bg-white/[0.08] [&:has(.no-parent-hover:hover)]:!bg-white/[0.03] [&:has(.no-parent-hover:hover)]:!shadow-none"
            ),
        "flex flex-col p-2.5 transition-all duration-200"
      )}
      onClick={handlePanelClick}
    >
      {displayBalance || slippageInput ? (
        <div className="flex w-full select-none items-center justify-between">
          <div className="text-sm text-subtitle">{label}</div>
          <div className="flex items-center justify-center gap-1 text-xs text-subtitle">
            {displayBalance ? (
              <>
                <div> {formatBigIntFloor(maxWeiValue, asset?.decimals || 18, 2)}</div>
                <IconWallet className="w-3"></IconWallet>
              </>
            ) : (
              <div className="stop-focus no-parent-hover">{slippageInput}</div>
            )}
          </div>
        </div>
      ) : (
        <div className="select-none text-sm text-subtitle">{label}</div>
      )}

      <div className="flex justify-between">
        <div className="flex max-w-44 items-center justify-start gap-2">
          <div className="relative inline-block w-full max-w-[250px]">
            <span ref={inputSpanRef} className="invisible absolute whitespace-pre bg-transparent text-[24px] font-semibold" aria-hidden="true" />

            <input
              {...props}
              lang="en"
              disabled={isLoading || disabled}
              type="text"
              value={isLoading ? "-" : localDisplay}
              placeholder="0.00"
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={cn(
                "auto-grow",
                "block w-full",
                "bg-transparent text-left text-[24px] font-semibold",
                "placeholder:text-left placeholder:text-gray-400",
                "focus:outline-none",
                "truncate"
              )}
              ref={inputRef}
              step="any"
              inputMode="decimal"
            />
          </div>

          <div className="select-none text-xs text-subtitle">{isLoading ? "($-)" : dollarDepositDisplay}</div>
        </div>

        <div className="stop-focus flex select-none items-center justify-center gap-2">
          <div className="flex gap-1">{isZapping && <IconThunder className="h-auto w-[8px] text-row-tonic" />}</div>
          <div className="no-parent-hover order-1 rounded-[10px] lg:order-2">{depositSelect}</div>
        </div>
      </div>

      <div className="mt-1 flex w-full items-center gap-2">
        {isSliderDisplay && (
          <div className="group flex w-full flex-col">
            <SliderInput
              disabled={disabled}
              value={sliderPercentage}
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
