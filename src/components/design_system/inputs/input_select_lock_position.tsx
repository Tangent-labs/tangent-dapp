"use client"

import { MaxButton } from "./MaxButton"
import { SliderInput } from "./SliderInput"
import { formatUnits, parseUnits } from "viem"
import { IconThunder } from "@/components/icons"
import { BorderPanel } from "../structure/border_panel"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { cn, PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"
import { useAutoGrowInputWidth } from "@/hooks/useAutoGrowInputWidth"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatBigIntFloor, formatDollar } from "@/lib/number_formatter"

type InputSelectLockPositionProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string | ReactNode
  // Lock position dropdown (New / #tokenId)
  depositSelect: ReactNode
  // Asset dropdown (TAN or any zappable asset)
  assetSelect: ReactNode
  depositAsset?: AssetDataPriced | CollateralInfo
  onValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  isZapping?: boolean
  isLoading?: boolean
  slippageInput?: ReactNode
  bottomPart?: ReactNode
}

export const InputSelectLockPosition = ({
  depositAmount,
  balance = BigInt(0),
  labelDeposit = "You deposit",
  setMaxBalance,
  onValueChange,
  depositSelect = <></>,
  assetSelect = <></>,
  depositAsset,
  isZapping = false,
  isLoading = false,
  disabled,
  slippageInput,
  bottomPart,
  ...props
}: InputSelectLockPositionProps) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [sliderPercentage, setSliderPercentage] = useState<number>(0)

  const decimals = depositAsset?.decimals ?? 18

  // Input field value as a human readable string
  const [localDisplay, setLocalDisplay] = useState(() => (depositAmount !== undefined ? formatUnits(depositAmount, decimals) : ""))

  const { inputRef, inputSpanRef } = useAutoGrowInputWidth(localDisplay, { placeholder: "Amount", minPx: 32 })

  // ---------------------------
  // SYNC WITH PARENT VALUE
  // Updates local input display when parent value changes
  // ---------------------------
  useEffect(() => {
    if (depositAmount === undefined) {
      setLocalDisplay("")
      return
    }

    if (document.activeElement !== inputRef.current) {
      setLocalDisplay(formatBigIntFloor(depositAmount, decimals, depositAsset?.displayDecimals || 2))
    }
  }, [depositAmount, decimals])

  // ---------------------------
  // SYNC SLIDER WITH INPUT
  // ---------------------------
  useEffect(() => {
    if (!balance || balance === 0n) return
    if (depositAmount === undefined) {
      setSliderPercentage(0)
      return
    }
    const percentage = (Number(depositAmount) / Number(balance)) * 100
    setSliderPercentage(Math.min(100, Math.max(0, percentage)))
  }, [depositAmount, balance])

  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(depositAmount || BigInt(0), decimals)) * (depositAsset?.price || 0)
    return `(${formatDollar(val)})`
  }, [depositAmount, depositAsset, decimals])

  // ---------------------------
  // HANDLE INPUT CHANGE
  // Updates local display and calls parent callback with debounce
  // ---------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(",", ".").trim()

    // Allow empty string or valid numeric input
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setLocalDisplay(val)

      if (debounceRef.current) clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(() => {
        if (val === "") {
          onValueChange(undefined)
          return
        }
        try {
          onValueChange(parseUnits(val, decimals))
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("Invalid amount", val, err)
        }
      }, 400)
    }
  }

  const handleBlur = () => {
    if (localDisplay && localDisplay !== ".") {
      setLocalDisplay(localDisplay.replace(/^0+(\d)/, "$1"))
    }
  }

  // ---------------------------
  // HANDLE SLIDER CHANGE
  // ---------------------------
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = Number(e.target.value)

    // Immediate visual update
    setSliderPercentage(percentage)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!balance || balance === 0n) return

    debounceRef.current = setTimeout(() => {
      const wei = percentage === 100 ? balance : (BigInt(Math.round(percentage)) * balance) / 100n

      onValueChange(wei)
      setLocalDisplay(formatBigIntFloor(wei, decimals, depositAsset?.displayDecimals || 2))
    }, 300)
  }

  const handleMaxClick = () => {
    setMaxBalance()
    setSliderPercentage(100)
    if (balance !== 0n) {
      setLocalDisplay(formatBigIntFloor(balance, decimals, depositAsset?.displayDecimals || 2))
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
        "flex w-full flex-col p-2.5 transition-all duration-200"
      )}
      onClick={handlePanelClick}
    >
      <div className="flex w-full select-none items-center justify-between">
        <div className="text-sm text-subtitle">{labelDeposit}</div>
        {slippageInput && <div className="stop-focus no-parent-hover text-xs text-subtitle">{slippageInput}</div>}
      </div>

      <div className="flex justify-between gap-2">
        <div className="flex max-w-44 items-center justify-start gap-2">
          <div className="relative inline-block w-full max-w-[250px]">
            <span ref={inputSpanRef} className="invisible absolute whitespace-pre bg-transparent text-[24px] font-semibold" aria-hidden="true" />

            <input
              {...props}
              lang="en"
              disabled={isLoading || disabled}
              type="text"
              value={localDisplay}
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

          <div className="select-none text-xs text-subtitle">{dollarDepositDisplay}</div>
        </div>

        <div className="stop-focus flex select-none items-center justify-center gap-2">
          {isZapping && <IconThunder className="h-auto w-[8px] text-row-tonic" />}
          <div className="no-parent-hover rounded-[10px]">{assetSelect}</div>
          <div className="no-parent-hover rounded-[10px]">{depositSelect}</div>
        </div>
      </div>

      <div className="mt-1 flex w-full items-center gap-2">
        <div className="group flex w-full flex-col">
          <SliderInput
            disabled={disabled}
            value={sliderPercentage}
            handleSliderChange={handleSliderChange}
            legendValues={PERCENTAGE_INPUT_AMOUNT}
            startEndRange={["0", "100", "1"]}
            unit="%"
          />
        </div>
        <MaxButton className="stop-focus" onClick={() => handleMaxClick()} />
      </div>

      {bottomPart}
    </BorderPanel>
  )
}
