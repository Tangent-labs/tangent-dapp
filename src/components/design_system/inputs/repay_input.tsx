"use client"

import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { AssetDataPriced } from "@/types"
import BorderPanel from "../structure/border_panel"
import { IconThunder } from "@/components/icons/icon_thunder"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatDisplayValue, formatDollar, toBigInt } from "@/lib/number_formatter"
import { SliderInput } from "./slider_input"

type RepayInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAsset?: AssetDataPriced
  depositAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  depositSelect: ReactNode
  onValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  isZapping?: boolean
  isLoading?: boolean
  percentage: number
  setPercentage: (value: number) => void
  displaySliderInput?: boolean
}

export function RepayInput({
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
}: RepayInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [innerValue, setInnerValue] = useState<string>(depositAmount !== undefined ? formatUnits(depositAmount, depositAsset?.decimals || 0) : "")

  const [isUserInput, setIsUserInput] = useState(false)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setPercentage || !depositAsset?.decimals || !balance) return

    const newPercentage = Number(e.target.value)
    setPercentage(newPercentage)

    let repayAmount: bigint
    if (newPercentage === 100) {
      repayAmount = balance
    } else {
      repayAmount = (BigInt(newPercentage) * balance) / BigInt(100)
    }

    const newValue = formatUnits(repayAmount, depositAsset.decimals)
    setInnerValue(formatDisplayValue(newValue))
    onValueChange(repayAmount)
  }

  useEffect(() => {
    if (depositAmount !== undefined && depositAsset?.decimals !== undefined) {
      const updatedValue = Number(formatUnits(depositAmount, depositAsset.decimals)).toFixed(3)
      setInnerValue(formatDisplayValue(updatedValue))
      setIsUserInput(false)
    }
  }, [depositAmount, depositAsset])

  useEffect(() => {
    if (!depositAsset?.decimals || !isUserInput || !balance) return

    const handler = setTimeout(() => {
      let val: bigint | string | undefined
      if (innerValue === "MAX") {
        val = balance
        if (setPercentage) setPercentage(100)
      } else {
        val = innerValue ? toBigInt(Number(innerValue), depositAsset.decimals) : undefined
        if (setPercentage && val !== undefined) {
          const percentageCalc = (Number(val) * 100) / Number(balance)
          setPercentage(Math.min(Math.round(percentageCalc), 100))
        }
      }
      onValueChange(val)
    }, 500)

    return () => clearTimeout(handler)
  }, [innerValue, depositAsset, isUserInput, onValueChange, setPercentage, balance])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setIsUserInput(true)
    setInnerValue(formatDisplayValue(newValue))

    if (newValue === "MAX" && setPercentage) {
      setPercentage(100)
    } else if (setPercentage && newValue !== "" && balance) {
      const val = toBigInt(Number(newValue), depositAsset?.decimals || 18)
      const percentageCalc = (Number(val) * 100) / Number(balance)
      setPercentage(Math.min(Math.round(percentageCalc), 100))
    }
  }

  const dollarDepositDisplay = useMemo(() => {
    if (innerValue === "MAX") return "MAX"
    const val = Number(innerValue || 0) * (Number(depositAsset?.price) || 0)
    return formatDollar(val) || "-"
  }, [innerValue, depositAsset])

  const onClickFocus = () => {
    inputRef.current?.focus()
  }

  return (
    <BorderPanel
      className={cn(
        isLoading ? "shimmer" : "",
        disabled ? "bg-panel-disabled" : "bg-select-input",
        "flex cursor-pointer flex-col p-2 transition-colors duration-200 hover:bg-white/10"
      )}
      onClick={onClickFocus}
    >
      <div className="flex w-full justify-between">
        <div className="text-sm text-subtitle">{labelDeposit}</div>
      </div>
      <div className="flex justify-between">
        <div className="flex items-center justify-start">
          <input
            {...props}
            disabled={isLoading || disabled}
            type="text"
            value={innerValue}
            placeholder="Amount"
            onInput={handleInputChange}
            ref={inputRef}
            className={cn("auto-grow bg-transparent text-[24px] font-semibold focus:outline-none")}
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
            <input
              type="range"
              min="0"
              step="1"
              max="100"
              disabled={disabled}
              value={percentage}
              onChange={handleSliderChange}
              className={cn("mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#070707]", disabled ? "cursor-default" : "cursor-pointer")}
              style={{
                background: `linear-gradient(to right, #3b82f6 ${percentage}%, #4b5563 ${percentage}%)`,
              }}
            />

            <SliderInput handleSliderChange={handleSliderChange}></SliderInput>
          </div>
        )}

        <BorderPanel
          className="ml-1 flex w-10 cursor-pointer items-center bg-button-active px-1 text-xs text-white hover:font-semibold"
          onClick={() => {
            if (setMaxBalance) {
              setMaxBalance()
              setPercentage(100)
            }
          }}
        >
          Max.
        </BorderPanel>
      </div>
    </BorderPanel>
  )
}
