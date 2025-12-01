"use client"

import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import BorderPanel from "../structure/border_panel"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { IconThunder } from "@/components/icons/icon_thunder"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatDisplayValue, formatDollar, toBigInt } from "@/lib/number_formatter"
import { SliderInput } from "./slider_input"

type DepositInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAsset?: AssetDataPriced | CollateralInfo
  depositAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  depositSelect: ReactNode
  depositInput?: ReactNode
  onValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  isZapping?: boolean
  isLoading?: boolean
  percentage: number
  setPercentage: (value: number) => void
  displaySliderInput?: boolean
}

export function DepositInput({
  depositAmount,
  balance,
  depositAsset,
  labelDeposit = "You Deposit",
  setMaxBalance,
  onValueChange,
  depositSelect = <></>,
  isZapping = false,
  isLoading = false,
  percentage = 0,
  displaySliderInput = false,
  disabled,
  setPercentage,
  ...props
}: DepositInputProps) {
  const balanceNumber = useMemo(() => {
    if (balance) {
      return Number(formatUnits(balance, depositAsset?.decimals || 18))
    }
    return 0
  }, [balance, depositAsset])

  const inputRef = useRef<HTMLInputElement>(null)

  const [innerValue, setInnerValue] = useState<string>(depositAmount !== undefined ? formatUnits(depositAmount, depositAsset?.decimals || 18) : "")

  const [isUserInput, setIsUserInput] = useState(false)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!setPercentage) {
      const newPercentage = Number(e.target.value)
      setPercentage(newPercentage)
      const newValue = newPercentage === 100 ? balanceNumber : Number(((newPercentage / 100) * balanceNumber).toFixed(0))
      setInnerValue(formatDisplayValue(newValue))
      onValueChange(!!newValue ? toBigInt(newValue, depositAsset?.decimals || 18) : undefined)
    }
  }

  useEffect(() => {
    if (depositAmount !== undefined && depositAsset?.decimals !== undefined) {
      const updatedValue = formatUnits(depositAmount, depositAsset.decimals)
      setInnerValue(formatDisplayValue(updatedValue))
      setIsUserInput(false)
    }
  }, [depositAmount, depositAsset])

  useEffect(() => {
    if (!depositAsset?.decimals || !isUserInput) return

    const handler = setTimeout(() => {
      const val = innerValue ? toBigInt(Number(innerValue), depositAsset.decimals) : undefined
      onValueChange(val)
    }, 500)

    return () => clearTimeout(handler)
  }, [innerValue, depositAsset, isUserInput, onValueChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setIsUserInput(true)
    setInnerValue(formatDisplayValue(newValue))

    if (!!setPercentage) {
      setPercentage(newValue !== "" && balanceNumber > 0 ? (Number(newValue) / balanceNumber) * 100 : 0)
    }
  }

  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(depositAmount || BigInt(0), depositAsset?.decimals || 0)) * (depositAsset?.price || 0)
    return `(${formatDollar(val)})`
  }, [depositAmount, depositAsset])

  const onClickFocus = () => {
    inputRef.current?.focus()
  }

  return (
    <BorderPanel
      className={cn(
        isLoading ? "shimmer" : "",
        disabled ? "bg-panel-disabled" : "bg-white bg-opacity-[3%]",
        "flex cursor-pointer flex-col p-2 transition-colors duration-200 hover:bg-white/10"
      )}
      onClick={onClickFocus}
    >
      <div className="text-sm text-subtitle">{labelDeposit}</div>
      <div className="flex justify-between">
        <div className="flex items-center justify-start">
          <input
            {...props}
            disabled={isLoading || disabled}
            type="number"
            value={innerValue}
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
          <div className="order-1 lg:order-2">{depositSelect}</div>
        </div>
      </div>

      <div className="flex w-full cursor-pointer items-center gap-2">
        {displaySliderInput && (
          <div className="flex w-full flex-col">
            <SliderInput disabled={disabled} percentage={percentage} handleSliderChange={handleSliderChange}></SliderInput>
          </div>
        )}

        {!disabled && (
          <BorderPanel
            className="w-10 min-w-10 cursor-pointer bg-button-active px-1 text-center text-xs text-white hover:font-semibold"
            onClick={() => {
              if (setMaxBalance) {
                setPercentage(100)
                setMaxBalance()
              }
            }}
          >
            Max.
          </BorderPanel>
        )}
      </div>
    </BorderPanel>
  )
}
