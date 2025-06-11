"use client"

import { IconWallet } from "@/components/icons/icon_wallet"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatBigInt, toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import { IconTan } from "@/components/icons/icon_tan"

type InputSelectLockPositionProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string
  depositAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  depositSelect: ReactNode
  depositInput?: ReactNode
  onValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  displayBalance?: boolean
  isLoading?: boolean
}

export const InputSelectLockPosition = ({
  depositAmount,
  balance = BigInt(0),
  labelDeposit = "You Deposit",
  setMaxBalance,
  onValueChange,
  depositSelect = <></>,
  displayBalance = true,
  isLoading = false,
  ...props
}: InputSelectLockPositionProps) => {
  const balanceNumber = Number(formatUnits(balance, 18))

  const [percentage, setPercentage] = useState<number>(0)

  const [innerValue, setInnerValue] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (depositAmount !== undefined) {
      const depositAsNumber = Number(formatUnits(depositAmount, 18))
      setInnerValue(depositAsNumber)
      setPercentage(balanceNumber > 0 ? (depositAsNumber / balanceNumber) * 100 : 0)
    }
  }, [depositAmount, balanceNumber])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value ? Number(e.target.value) : undefined
    setInnerValue(newValue)
    setPercentage(newValue !== undefined && balanceNumber > 0 ? (newValue / balanceNumber) * 100 : 0)
    onValueChange(newValue !== undefined ? toBigInt(newValue, 18) : undefined)
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = Number(e.target.value)
    setPercentage(newPercentage)
    const newValue = newPercentage !== 0 ? Number(((newPercentage / 100) * balanceNumber).toFixed(0)) : undefined
    setInnerValue(newValue)
    onValueChange(!!newValue ? toBigInt(newValue, 18) : undefined)
  }

  const displayBalanceData = useMemo(() => {
    return formatBigInt(balance || "0", 18, 2)
  }, [balance])

  const dollarDepositDisplay = useMemo(() => {
    return innerValue !== undefined ? (innerValue * 0.3).toFixed(2) : "0"
  }, [innerValue])

  return (
    <div
      className={`${isLoading ? "shimmer" : ""} flex h-full w-full flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 p-2 backdrop-blur-[60px]`}
    >
      <div className="mb-3 flex h-full w-full items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-subtitle">{labelDeposit}</div>

          <div className="text-xl">
            <input
              {...props}
              disabled={isLoading}
              type="number"
              value={innerValue !== undefined ? innerValue : ""}
              placeholder="Amount"
              onInput={handleInputChange}
              className={cn("min-h-10 rounded-[10px] border-opacity-20 bg-transparent py-2 font-semibold focus:outline-none")}
            />
          </div>

          <div className="text-xs text-subtitle">$({dollarDepositDisplay})</div>
        </div>

        <div className="flex h-full flex-col items-center justify-center px-1">
          <div className="flex items-center justify-center rounded-[10px] bg-overlay-panel px-3 py-2 font-semibold backdrop-blur-[60px]">
            <IconTan className="mr-3"></IconTan>
            TAN
          </div>
        </div>

        <div className="flex h-full flex-col items-end justify-between">
          <>{depositSelect}</>

          <div className="mt-1 text-xs text-gray-400">
            {displayBalance && (
              <div className="flex cursor-pointer items-center">
                <span>{displayBalanceData}</span>
                <IconWallet className="w-6" />

                <button
                  className="flex w-10 cursor-pointer items-center rounded-full border border-white/50 bg-button-active px-1.5 py-0.5 text-xs text-white hover:font-semibold"
                  type="button"
                  onClick={() => {
                    if (setMaxBalance) setMaxBalance()
                  }}
                >
                  Max.
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        type="range"
        min="0"
        step="1"
        max="100"
        value={percentage}
        onChange={handleSliderChange}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-black"
        style={{
          background: `linear-gradient(to right, #3b82f6 ${percentage}%, #4b5563 ${percentage}%)`,
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
        <div className="relative flex w-fit items-center justify-center">
          25%
          <div
            onClick={() => handleSliderChange({ target: { value: "25" } } as React.ChangeEvent<HTMLInputElement>)}
            className="absolute -top-1.5 left-2 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
          ></div>
        </div>
        <div className="relative flex w-fit items-center justify-center">
          50%
          <div
            onClick={() => handleSliderChange({ target: { value: "50" } } as React.ChangeEvent<HTMLInputElement>)}
            className="absolute -top-1.5 left-2 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
          ></div>
        </div>
        <div className="relative flex w-fit items-center justify-center">
          75%
          <div
            onClick={() => handleSliderChange({ target: { value: "75" } } as React.ChangeEvent<HTMLInputElement>)}
            className="absolute -top-1.5 left-2 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
          ></div>
        </div>
        <div className="relative flex w-fit items-center justify-center">
          100%
          <div
            onClick={() => handleSliderChange({ target: { value: "100" } } as React.ChangeEvent<HTMLInputElement>)}
            className="absolute -top-1.5 right-1 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
          ></div>
        </div>
      </div>
    </div>
  )
}
