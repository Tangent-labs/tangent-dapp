"use client"

import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import BorderPanel from "../structure/border_panel"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { IconThunder, IconWallet } from "@/components/icons"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatBigInt, formatDisplayValue, formatDollar, toBigInt } from "@/lib/number_formatter"
import { SliderInput } from "./slider_input"

type GenericInputAssetAmountProps = React.InputHTMLAttributes<HTMLInputElement> & {
  inputWeiValue?: bigint
  onValueChange: (value: bigint | undefined) => void

  asset?: AssetDataPriced | CollateralInfo

  disabled?: boolean
  label: string
  depositSelect: ReactNode
  setMaxAmount: () => void
  isZapping?: boolean
  isLoading?: boolean

  balance?: bigint
  displayBalance?: boolean

  displaySliderInput?: boolean
  sliderPercentage?: number
  setSliderPercentage?: (value: number) => void
  sliderLegendValues?: string[]
}

export function GenericInputAssetAmount({
  inputWeiValue,
  balance,
  asset,
  label,
  setMaxAmount = () => {},
  onValueChange,
  depositSelect = <></>,
  isZapping = false,
  isLoading = false,
  sliderPercentage = 0,
  displaySliderInput = false,
  disabled,
  setSliderPercentage = () => {},
  displayBalance = false,
  sliderLegendValues,
  ...props
}: GenericInputAssetAmountProps) {
  const [inputNumberValue, setInnerValue] = useState<string>(inputWeiValue !== undefined ? formatUnits(inputWeiValue, asset?.decimals || 18) : "")

  const [isUserInput, setIsUserInput] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const sliderDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   *
   */
  useEffect(() => {
    if (inputWeiValue !== undefined && asset?.decimals !== undefined) {
      const updatedValue = formatUnits(inputWeiValue, asset.decimals)
      setInnerValue(formatDisplayValue(updatedValue))
      setIsUserInput(false)
    }
  }, [inputWeiValue, asset])

  useEffect(() => {
    if (!asset?.decimals || !isUserInput) return

    const handler = setTimeout(() => {
      const val = inputNumberValue ? toBigInt(Number(inputNumberValue), asset.decimals) : undefined
      onValueChange(val)
    }, 500)

    return () => clearTimeout(handler)
  }, [inputNumberValue, asset, isUserInput, onValueChange])

  /**
   * Format the balance amount of the active asset
   * Updated when asset or balance is changed
   */
  const balanceNumber = useMemo(() => {
    if (balance) {
      return Number(formatUnits(balance, asset?.decimals || 18))
    }
    return 0
  }, [balance, asset])

  /**
   * Updated when
   */
  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(inputWeiValue || BigInt(0), asset?.decimals || 0)) * (asset?.price || 0)
    return `(${formatDollar(val)})`
  }, [inputWeiValue, asset])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setIsUserInput(true)
    setInnerValue(formatDisplayValue(newValue))

    if (!!setSliderPercentage) {
      setSliderPercentage(newValue !== "" && balanceNumber > 0 ? (Number(newValue) / balanceNumber) * 100 : 0)
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setSliderPercentage) return

    const newPercentage = Number(e.target.value)
    setSliderPercentage(newPercentage)

    if (sliderDebounceRef.current) {
      clearTimeout(sliderDebounceRef.current)
    }

    sliderDebounceRef.current = setTimeout(() => {
      const newValue = newPercentage === 100 ? balanceNumber : Number(((newPercentage / 100) * balanceNumber).toFixed(0))
      setInnerValue(formatDisplayValue(newValue))
      onValueChange(!!newValue ? toBigInt(newValue, asset?.decimals || 18) : undefined)
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
            {formatBigInt(balance, asset?.decimals || 18, 2)}
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
            disabled={isLoading || disabled}
            type="number"
            value={inputNumberValue}
            placeholder="Amount"
            onChange={handleInputChange}
            className="auto-grow bg-transparent text-[24px] font-semibold focus:outline-none"
            ref={inputRef}
            step="any"
          />

          <div className="text-xs text-subtitle">{dollarDepositDisplay}</div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-1">{isZapping && <IconThunder className="h-auto w-[8px] text-row-tonic" />}</div>
          <div className="no-parent-hover order-1 rounded-md lg:order-2">{depositSelect}</div>
        </div>
      </div>

      <div className="flex w-full items-center gap-2">
        {displaySliderInput && (
          <div className="group flex w-full flex-col">
            <SliderInput disabled={disabled} percentage={sliderPercentage} handleSliderChange={handleSliderChange} legendValues={sliderLegendValues} />
          </div>
        )}

        {!disabled && (
          <>
            <style jsx>{`
              @keyframes pulse-glow {
                0%,
                100% {
                  opacity: 0.85;
                }
                50% {
                  opacity: 1;
                }
              }

              .pulse-bg {
                animation: pulse-glow 2s ease-in-out infinite;
              }
            `}</style>

            <div
              className="relative h-5 w-10 min-w-10 cursor-pointer overflow-hidden rounded-[10px] transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={() => {
                if (setMaxAmount) {
                  setSliderPercentage(100)
                  setMaxAmount()
                }
              }}
            >
              {/* Background bleu avec pulse */}
              <div
                className="pulse-bg absolute inset-0 rounded-[10px]"
                style={{
                  background: `linear-gradient(135deg, #0055ff 0%, #0088ff 50%, #0055ff 100%)`,
                }}
              />

              {/* Bordure  */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[10px]"
                style={{
                  padding: "1px",
                  background: `
          linear-gradient(0deg, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0.2) 100%)`,
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />

              {/* Texte */}
              <span className="relative z-10 flex h-full items-center justify-center text-xs font-medium text-white hover:font-bold">Max.</span>
            </div>
          </>
        )}
      </div>
    </BorderPanel>
  )
}
