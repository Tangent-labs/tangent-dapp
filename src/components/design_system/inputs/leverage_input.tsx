"use client"

import { AssetDataPriced, CollateralInfo } from "@/types"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import TokenImage from "../structure/token_image"
import { formatDollar, toBigInt } from "@/lib/number_formatter"
import BorderPanel from "../structure/border_panel"

type LeverageInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAsset?: AssetDataPriced | CollateralInfo
  borrowAsset?: AssetDataPriced | CollateralInfo
  depositAmount?: bigint
  disabled?: boolean
  label?: string
  LeverageInput?: ReactNode
  isLoading?: boolean
  percentage?: number
  onValueChange: (value: bigint) => Promise<void>
  setPercentage?: (value: number) => void
}

export function LeverageInput({
  depositAmount,
  borrowAsset,
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

  const inputRef = useRef<HTMLInputElement>(null)

  const [innerValue, setInnerValue] = useState<string>(depositAmount !== undefined ? formatUnits(depositAmount, depositAsset?.decimals || 0) : "0")

  useEffect(() => {
    if (depositAmount === 0n) {
      setInnerValue("0")
    }
  }, [depositAmount])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!setPercentage && depositAsset) {
      const newPercentage = Number(e.target.value)
      setPercentage(newPercentage)

      const inputValueToUSD = depositAmountNumber * depositAsset?.price
      const newValue = newPercentage !== 0 ? Number((newPercentage * inputValueToUSD - inputValueToUSD).toFixed(0)) : 0

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
    if (!depositAsset?.decimals || !innerValue || innerValue === "0") return
    const handler = setTimeout(() => {
      const val = innerValue ? toBigInt(Number(innerValue), depositAsset.decimals) : undefined
      onValueChange(val!)
    }, 500)

    return () => clearTimeout(handler)
  }, [innerValue, depositAsset])

  const dollarDepositDisplay = useMemo(() => {
    if (innerValue && borrowAsset?.decimals && borrowAsset?.price) {
      const val = Number(formatUnits(toBigInt(Number(innerValue), 18), borrowAsset.decimals)) * borrowAsset.price
      return `(${formatDollar(val)})`
    }
    return "($0)"
  }, [innerValue, borrowAsset])

  const onClickFocus = () => {
    inputRef.current?.focus()
  }

  return (
    <BorderPanel onClick={onClickFocus} className={`${isLoading ? "shimmer" : ""} flex cursor-pointer flex-col bg-white bg-opacity-[3%] p-2`}>
      <div className="flex w-full justify-between">
        <div className="text-sm text-subtitle">{label}</div>
      </div>
      <div className="mb-1 flex justify-between">
        <div className="flex items-center justify-start">
          <input
            {...props}
            type="string"
            ref={inputRef}
            value={innerValue}
            onInput={handleInputChange}
            placeholder="Amount"
            className={cn("auto-grow bg-transparent text-[24px] font-semibold focus:outline-none")}
          />

          <div className="text-xs text-subtitle">{dollarDepositDisplay}</div>
        </div>

        <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
          <TokenImage token="USG" size={20} />
          <span className="flex flex-col text-[15px] font-semibold">USG</span>
        </BorderPanel>
      </div>

      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex w-full flex-col">
          <input
            type="range"
            min="1"
            step="0.1"
            max="10"
            value={percentage}
            onChange={handleSliderChange}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#070707]"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${percentage}%, #4b5563 ${percentage * 10}%)`,
            }}
          />

          <div className="flex w-full items-center justify-between text-[10px] text-subtitle">
            <div className="relative flex w-fit items-center justify-center">
              x1
              <div
                onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "0" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
                className="absolute -top-1.5 left-1 mt-[1px] h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
              ></div>
            </div>

            {[2, 3, 4, 5, 6, 7, 8, 9].map((el) => (
              <div key={el} className="relative flex w-fit items-center justify-center">
                x{el}
                <div
                  onClick={
                    !!handleSliderChange ? () => handleSliderChange({ target: { value: el.toString() } } as React.ChangeEvent<HTMLInputElement>) : () => {}
                  }
                  className="absolute -top-1.5 left-2 mt-[1px] h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                ></div>
              </div>
            ))}

            <div className="relative flex w-fit items-center justify-center">
              x10
              <div
                onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "10" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
                className="absolute -top-1.5 right-1 mt-[1px] h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
              ></div>
            </div>
          </div>
        </div>

        <BorderPanel
          className="rounded-full! flex w-10 cursor-pointer items-center bg-button-active px-1 text-xs text-white hover:font-semibold"
          onClick={() => handleSliderChange({ target: { value: "10" } } as React.ChangeEvent<HTMLInputElement>)}
        >
          Max.
        </BorderPanel>
      </div>
    </BorderPanel>
  )
}
