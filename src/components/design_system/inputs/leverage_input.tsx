"use client"

import { AssetDataPriced } from "@/types"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import TokenImage from "../structure/token_image"
import { toBigInt } from "@/lib/number_formatter"
import BorderPanel from "../structure/border_panel"

type LeverageInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAsset?: AssetDataPriced
  className?: string
  depositAmount?: bigint
  borrowAmount?: bigint
  disabled?: boolean
  label?: string
  LeverageInput?: ReactNode
  isLoading?: boolean
  percentage?: number
  onValueChange: (value: bigint | undefined) => void
  setPercentage?: (value: number) => void
}

export function LeverageInput({
  className,
  depositAmount,
  borrowAmount,
  depositAsset,
  label,
  isLoading = false,
  percentage = 1,
  setPercentage,
  onValueChange,
  ...props
}: LeverageInputProps) {
  const depositAmountNumber = useMemo(() => {
    if (depositAmount) {
      return Number(formatUnits(depositAmount, 18))
    }
    return 0
  }, [depositAmount])

  const [innerValue, setInnerValue] = useState<string>(borrowAmount !== undefined ? formatUnits(borrowAmount, depositAsset?.decimals || 0) : "")

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!setPercentage) {
      const newPercentage = Number(e.target.value)
      setPercentage(newPercentage)
      const newValue = newPercentage !== 0 ? Number((newPercentage * depositAmountNumber - depositAmountNumber).toFixed(0)) : 0
      setInnerValue(newValue.toFixed(0))
    }
  }

  useEffect(() => {
    if (!!setPercentage) {
      setPercentage(innerValue !== undefined && depositAmountNumber > 0 ? Number(innerValue) / depositAmountNumber : 0)
    }
  }, [depositAmountNumber])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInnerValue(newValue)

    if (!!setPercentage) {
      setPercentage(newValue !== undefined && depositAmountNumber > 0 ? (Number(newValue) + depositAmountNumber) / depositAmountNumber : 0)
    }
  }

  useEffect(() => {
    if (!depositAsset?.decimals) return

    const handler = setTimeout(() => {
      const val = innerValue ? toBigInt(Number(innerValue), depositAsset.decimals) : undefined
      onValueChange(val)
    }, 500)

    return () => clearTimeout(handler)
  }, [innerValue, depositAsset, onValueChange])

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <BorderPanel className={`${isLoading ? "shimmer" : ""} flex flex-col bg-white bg-opacity-[3%] p-2`}>
        <div className="flex w-full justify-between">
          <div className="text-sm text-gray-400">{label}</div>
        </div>
        <div className="mb-2 flex flex-col justify-between lg:flex-row">
          <input
            {...props}
            type="number"
            value={innerValue}
            onInput={handleInputChange}
            placeholder="Amount"
            className={cn("min-h-10 rounded-[10px] border-opacity-20 bg-transparent text-xl font-semibold focus:outline-none")}
          />

          <BorderPanel className="flex items-center gap-2 bg-select-input px-3 py-2">
            <TokenImage token="tgUSD" size={20} />
            <span className="flex flex-col text-[15px] font-semibold">tgUSD</span>
          </BorderPanel>
        </div>

        <input
          type="range"
          min="1"
          step="0.1"
          max="10"
          value={percentage}
          onChange={handleSliderChange}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-black"
          style={{
            background: `linear-gradient(to right, #3b82f6 ${percentage}%, #4b5563 ${percentage * 10}%)`,
          }}
        />

        <div className="flex w-full items-center justify-between text-xs text-subtitle">
          <div className="relative flex w-fit items-center justify-center">
            x1
            <div
              onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "0" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
              className="absolute -top-1.5 left-1 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
            ></div>
          </div>

          {[2, 3, 4, 5, 6, 7, 8, 9].map((el) => (
            <div key={el} className="relative flex w-fit items-center justify-center">
              x{el}
              <div
                onClick={
                  !!handleSliderChange ? () => handleSliderChange({ target: { value: el.toString() } } as React.ChangeEvent<HTMLInputElement>) : () => {}
                }
                className="absolute -top-1.5 left-2 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
              ></div>
            </div>
          ))}

          <div className="relative flex w-fit items-center justify-center">
            x10
            <div
              onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "10" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
              className="absolute -top-1.5 right-1 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
            ></div>
          </div>
        </div>
      </BorderPanel>
    </div>
  )
}
