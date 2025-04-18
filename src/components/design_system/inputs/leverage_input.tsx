"use client"

import { AssetDataPriced } from "@/types"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
type LeverageInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAsset?: AssetDataPriced
  className?: string
  depositAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  depositSelect: ReactNode
  LeverageInput?: ReactNode
  onValueChange: (value: bigint | undefined) => void
  isLoading?: boolean
  percentage?: number
  setPercentage?: (value: number) => void
  displaySliderInput?: boolean
}

export function LeverageInput({
  className,
  depositAmount,
  balance,
  depositAsset,
  labelDeposit = "You Deposit",
  onValueChange,
  depositSelect = <></>,
  isLoading = false,
  percentage = 0,
  displaySliderInput = false,
  setPercentage,
  ...props
}: LeverageInputProps) {
  const balanceNumber = useMemo(() => {
    if (balance) {
      return Number(formatUnits(balance, 18))
    }
    return 0
  }, [balance])

  const [innerValue, setInnerValue] = useState<string>(depositAmount !== undefined ? formatUnits(depositAmount, depositAsset?.decimals || 0) : "")
  const [isUserInput, setIsUserInput] = useState(false)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!setPercentage) {
      const newPercentage = Number(e.target.value)
      setPercentage(newPercentage)
      const newValue = newPercentage !== 0 ? Number(((newPercentage / 100) * balanceNumber).toFixed(0)) : 0
      setInnerValue(newValue.toFixed(0))
      onValueChange(!!newValue ? toBigInt(newValue, 18) : undefined)
    }
  }

  useEffect(() => {
    if (depositAmount !== undefined && depositAsset?.decimals !== undefined) {
      const updatedValue = Number(formatUnits(depositAmount, depositAsset.decimals)).toFixed(0)
      setInnerValue(updatedValue)
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
    setInnerValue(newValue)

    if (!!setPercentage) {
      setPercentage(newValue !== undefined && balanceNumber > 0 ? (Number(newValue) / balanceNumber) * 100 : 0)
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div className={`${isLoading ? "shimmer" : ""} flex flex-col rounded-[10px] border border-white border-opacity-20 bg-select-input p-2`}>
        <div className="flex w-full justify-between">
          <div className="text-sm text-gray-400">{labelDeposit}</div>
        </div>
        <div className="mb-2 flex flex-col justify-between lg:flex-row">
          <div className="order-2 text-xl lg:order-1">
            <input
              {...props}
              disabled={isLoading}
              type="number"
              value={innerValue}
              placeholder="Amount"
              onInput={handleInputChange}
              className={cn(
                "min-h-10 rounded-[10px] border-opacity-20 bg-transparent p-2 font-bold focus:outline-none disabled:bg-gray-400 disabled:bg-opacity-30"
              )}
            />
          </div>
          <div className="order-1 lg:order-2">{depositSelect}</div>
        </div>

        {displaySliderInput && (
          <>
            <input
              type="range"
              min="0"
              step="1"
              max="100"
              value={percentage}
              onChange={handleSliderChange}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-black"
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
