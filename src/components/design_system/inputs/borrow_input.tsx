"use client"

import { AssetDataPriced } from "@/types"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatDisplayValue, toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import { IconThunder } from "@/components/icons/icon_thunder"

type BorrowInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  borrowAsset?: AssetDataPriced
  className?: string
  borrowAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  depositSelect: ReactNode
  borrowInput?: ReactNode
  onValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  isZapping?: boolean
  isLoading?: boolean
  percentage: number
  setPercentage: (value: number) => void
  displaySliderInput?: boolean
}

export function BorrowInput({
  className,
  borrowAmount,
  balance,
  borrowAsset,
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
}: BorrowInputProps) {
  const balanceNumber = useMemo(() => {
    if (balance) {
      return Number(formatUnits(balance, borrowAsset?.decimals || 18))
    }
    return 0
  }, [balance, borrowAsset])

  const [innerValue, setInnerValue] = useState<string>(borrowAmount !== undefined ? formatUnits(borrowAmount, borrowAsset?.decimals || 18) : "")
  const [isUserInput, setIsUserInput] = useState(false)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!setPercentage) {
      const newPercentage = Number(e.target.value)
      setPercentage(newPercentage)
      const newValue = newPercentage !== 0 ? Number(((newPercentage / 100) * balanceNumber).toFixed(0)) : 0
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
      return `($${val.toFixed(2)})`
    }
    return "($0)"
  }, [borrowAmount, borrowAsset])

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div
        className={cn(
          isLoading ? "shimmer" : "",
          disabled ? "bg-panel-disabled" : "bg-white bg-opacity-[3%]",
          "flex flex-col rounded-[10px] border-2 border-white border-opacity-20 p-2 transition-colors duration-200 hover:bg-white/10"
        )}
      >
        <div className="flex w-full justify-between">
          <div className="text-sm text-gray-400">{labelDeposit}</div>
          {isZapping && (
            <div className="flex items-center justify-center gap-1">
              <div className="text-sm text-gray-400">Zap</div>
              <IconThunder className="h-auto w-[8px] text-row-tonic" />
              <IconCircleHelp className="h-auto w-[12px] text-row-tonic" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between lg:flex-row">
          <div className="order-2 text-xl lg:order-1">
            <input
              {...props}
              disabled={isLoading || disabled}
              type="number"
              value={innerValue}
              placeholder="Amount"
              onChange={handleInputChange}
              className={cn("min-h-10 rounded-[10px] border-opacity-20 bg-transparent font-semibold focus:outline-none")}
              step="any"
            />
          </div>
          <div className="order-1 lg:order-2">{depositSelect}</div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <div>{dollarDepositDisplay}</div>

          <div className="flex cursor-pointer items-center">
            <button
              className="ml-1 flex w-10 cursor-pointer items-center rounded-full border-2 border-white/50 bg-button-active px-1.5 py-0.5 text-xs text-white hover:font-semibold"
              type="button"
              onClick={() => {
                if (setMaxBalance) {
                  setPercentage(100)
                  setMaxBalance()
                }
              }}
            >
              Max.
            </button>
          </div>
        </div>

        {displaySliderInput && (
          <>
            <input
              type="range"
              min="0"
              step="1"
              max="100"
              disabled={disabled}
              value={percentage}
              onChange={handleSliderChange}
              className={cn("mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-black", disabled ? "cursor-default" : "cursor-pointer")}
              style={{
                background: `linear-gradient(to right, #3b82f6 ${percentage}%, #4b5563 ${percentage}%)`,
              }}
            />
            <div className="flex w-full items-center justify-between text-xs text-subtitle">
              <div className="relative flex w-fit items-center justify-center">
                0%
                <div
                  onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "0" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
                  className="absolute -top-1.5 left-1 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                ></div>
              </div>
              {[25, 50, 75].map((el) => (
                <div key={el} className="relative flex w-fit items-center justify-center">
                  {el}%
                  <div
                    onClick={
                      !!handleSliderChange ? () => handleSliderChange({ target: { value: el.toString() } } as React.ChangeEvent<HTMLInputElement>) : () => {}
                    }
                    className="absolute -top-1.5 left-2 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                  ></div>
                </div>
              ))}
              <div className="relative flex w-fit items-center justify-center">
                100%
                <div
                  onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "100" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
                  className="absolute -top-1.5 right-1 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                ></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
