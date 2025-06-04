"use client"

import { IconWallet } from "@/components/icons/icon_wallet"
import { AssetDataPriced } from "@/types"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatBigInt, toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import { IconThunder } from "@/components/icons/icon_thunder"

type RepayInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAsset?: AssetDataPriced
  className?: string
  depositAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  depositSelect: ReactNode
  onValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  displayBalance?: boolean
  isZapping?: boolean
  isLoading?: boolean
  percentage?: number
  setPercentage?: (value: number) => void
  displaySliderInput?: boolean
  userDebt: bigint
  minimumLoan: bigint
}

export function RepayInput({
  className,
  depositAmount,
  balance,
  depositAsset,
  labelDeposit = "You Deposit",
  setMaxBalance,
  onValueChange,
  depositSelect = <></>,
  displayBalance = true,
  isZapping = false,
  isLoading = false,
  percentage = 0,
  displaySliderInput = false,
  disabled,
  setPercentage,
  userDebt,
  minimumLoan,
  ...props
}: RepayInputProps) {
  const [innerValue, setInnerValue] = useState<string>(depositAmount !== undefined ? formatUnits(depositAmount, depositAsset?.decimals || 0) : "")
  const [isUserInput, setIsUserInput] = useState(false)

  const isDebtBelowThreshold = useMemo(() => {
    if (!depositAsset?.decimals || !userDebt || innerValue === "") return false
    if (userDebt === toBigInt(Number(innerValue), depositAsset.decimals)) return false
    const repayAmount = innerValue === "MAX" ? balance || BigInt(0) : toBigInt(Number(innerValue), depositAsset.decimals)
    const threshold = minimumLoan
    return userDebt - repayAmount < threshold
  }, [innerValue, userDebt, depositAsset, balance])

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
    setInnerValue(newValue)
    onValueChange(repayAmount)
  }

  useEffect(() => {
    if (depositAmount !== undefined && depositAsset?.decimals !== undefined) {
      const updatedValue = Number(formatUnits(depositAmount, depositAsset.decimals)).toFixed(0)
      setInnerValue(updatedValue)
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
    setInnerValue(newValue)

    if (newValue === "MAX" && setPercentage) {
      setPercentage(100)
    } else if (setPercentage && newValue !== "" && balance) {
      const val = toBigInt(Number(newValue), depositAsset?.decimals || 18)
      const percentageCalc = (Number(val) * 100) / Number(balance)
      setPercentage(Math.min(Math.round(percentageCalc), 100))
    }
  }

  const displayBalanceData = useMemo(() => {
    const formattedBalance = formatBigInt(balance || "0", depositAsset?.decimals || 18, depositAsset?.displayDecimals || 2)
    return `${formattedBalance} ${depositAsset?.symbol || ""}`
  }, [balance, depositAsset])

  const dollarDepositDisplay = useMemo(() => {
    if (innerValue === "MAX") return "MAX"
    const val = Number(innerValue || 0) * (depositAsset?.price || 0)
    return val?.toFixed(2) || "-"
  }, [innerValue, depositAsset])

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div
        className={cn(
          isLoading ? "shimmer" : "",
          disabled ? "bg-panel-disabled" : "bg-select-input",
          "flex flex-col rounded-[10px] border border-white border-opacity-20 p-2"
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
              type="text"
              value={innerValue}
              placeholder="Amount"
              onInput={handleInputChange}
              className={cn("min-h-10 rounded-[10px] border-opacity-20 bg-transparent pl-1 font-bold focus:outline-none")}
            />
          </div>
          <div className="order-1 lg:order-2">{depositSelect}</div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <div>$({dollarDepositDisplay})</div>
          {displayBalance && (
            <button
              className="flex cursor-pointer items-center"
              type="button"
              onClick={() => {
                if (setMaxBalance) setMaxBalance()
              }}
            >
              <span>{displayBalanceData}</span>
              <IconWallet className="w-6" />
            </button>
          )}
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
                background: `linear-gradient(to right, ${isDebtBelowThreshold ? "#ef4444" : "#3b82f6"} ${percentage}%, #4b5563 ${percentage}%)`,
              }}
            />

            <div className="flex w-full items-center justify-between text-xs text-subtitle">
              <div className="relative flex w-fit items-center justify-center">
                0%
                <div
                  onClick={() => handleSliderChange({ target: { value: "0" } } as React.ChangeEvent<HTMLInputElement>)}
                  className="absolute -top-1.5 left-1 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                ></div>
              </div>

              {[25, 50, 75].map((el) => (
                <div key={el} className="relative flex w-fit items-center justify-center">
                  {el}%
                  <div
                    onClick={() => handleSliderChange({ target: { value: el.toString() } } as React.ChangeEvent<HTMLInputElement>)}
                    className="absolute -top-1.5 left-2 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                  ></div>
                </div>
              ))}

              <div className="relative flex w-fit items-center justify-center">
                100%
                <div
                  onClick={() => handleSliderChange({ target: { value: "100" } } as React.ChangeEvent<HTMLInputElement>)}
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
