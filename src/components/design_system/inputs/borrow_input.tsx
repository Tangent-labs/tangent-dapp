"use client"

import { AssetDataPriced } from "@/types"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatDisplayValue, formatDollar, toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import BorderPanel from "../structure/border_panel"
import { SliderInput } from "./slider_input"

type BorrowInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  borrowAsset?: AssetDataPriced
  borrowAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  depositSelect: ReactNode
  borrowInput?: ReactNode
  onValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  isLoading?: boolean
  percentage: number
  setPercentage: (value: number) => void
  displaySliderInput?: boolean
}

export function BorrowInput({
  borrowAmount,
  balance,
  borrowAsset,
  labelDeposit = "You deposit",
  setMaxBalance,
  onValueChange,
  depositSelect = <></>,
  isLoading = false,
  percentage = 0,
  displaySliderInput = false,
  disabled,
  setPercentage,
  ...props
}: BorrowInputProps) {
  const balanceNumber = useMemo(() => {
    if (balance) {
      return Number(formatUnits(balance, borrowAsset?.decimals || 18))
    }
    return 0
  }, [balance, borrowAsset])

  const inputRef = useRef<HTMLInputElement>(null)

  const [innerValue, setInnerValue] = useState<string>(borrowAmount !== undefined ? formatUnits(borrowAmount, borrowAsset?.decimals || 18) : "")

  const [isUserInput, setIsUserInput] = useState(false)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!setPercentage) {
      const newPercentage = Number(e.target.value)
      setPercentage(newPercentage)
      const newValue = newPercentage === 100 ? balanceNumber : Number(((newPercentage / 100) * balanceNumber).toFixed(0))
      setInnerValue(formatDisplayValue(newValue))
      onValueChange(!!newValue ? toBigInt(newValue, borrowAsset?.decimals || 18) : undefined)
    }
  }

  useEffect(() => {
    if (borrowAmount !== undefined && borrowAsset?.decimals !== undefined) {
      const updatedValue = formatUnits(borrowAmount, borrowAsset.decimals)
      setInnerValue(formatDisplayValue(updatedValue))
      setIsUserInput(false)
    }
  }, [borrowAmount, borrowAsset])

  useEffect(() => {
    if (!borrowAsset?.decimals || !isUserInput) return

    const handler = setTimeout(() => {
      const val = innerValue ? toBigInt(Number(innerValue), borrowAsset.decimals) : undefined
      onValueChange(val)
    }, 500)

    return () => clearTimeout(handler)
  }, [innerValue, borrowAsset, isUserInput, onValueChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setIsUserInput(true)
    setInnerValue(formatDisplayValue(newValue))

    if (!!setPercentage) {
      setPercentage(newValue !== "" && balanceNumber > 0 ? (Number(newValue) / balanceNumber) * 100 : 0)
    }
  }

  const dollarDepositDisplay = useMemo(() => {
    if (borrowAmount && borrowAsset?.decimals && borrowAsset?.price) {
      const val = Number(formatUnits(borrowAmount, borrowAsset.decimals)) * borrowAsset.price
      return `(${formatDollar(val)})`
    }
    return "($0)"
  }, [borrowAmount, borrowAsset])

  const onClickFocus = () => {
    inputRef.current?.focus()
  }

  return (
    <BorderPanel
      className={cn(
        isLoading ? "shimmer" : "",
        disabled ? "bg-panel-disabled" : "cursor-pointer bg-white bg-opacity-[3%] hover:bg-white/10",
        "flex flex-col p-2 transition-colors duration-200"
      )}
      onClick={onClickFocus}
    >
      <div className="text-sm text-subtitle">{labelDeposit}</div>
      <div className="flex justify-between">
        <div className="flex items-center justify-start">
          <div className="text-xl">
            <input
              {...props}
              disabled={isLoading || disabled}
              type="number"
              value={innerValue}
              placeholder="Amount"
              onChange={handleInputChange}
              className={cn("auto-grow bg-transparent text-[24px] font-semibold focus:outline-none")}
              step="any"
              ref={inputRef}
            />
          </div>
          <div className="text-xs text-subtitle">{dollarDepositDisplay}</div>
        </div>

        <div className="order-1 lg:order-2">{depositSelect}</div>
      </div>
      <div className="flex w-full cursor-pointer items-center gap-2">
        {displaySliderInput && (
          <div className="flex w-full flex-col">
            <SliderInput disabled={disabled} percentage={percentage} handleSliderChange={handleSliderChange}></SliderInput>
          </div>
        )}

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
      </div>
    </BorderPanel>
  )
}
