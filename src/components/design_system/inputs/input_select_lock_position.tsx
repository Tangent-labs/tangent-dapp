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
  balance,
  labelDeposit = "You Deposit",
  setMaxBalance,
  onValueChange,
  depositSelect = <></>,
  displayBalance = true,
  isLoading = false,
  ...props
}: InputSelectLockPositionProps) => {
  const [innerValue, setInnerValue] = useState<number | undefined>(depositAmount !== undefined ? Number(formatUnits(depositAmount, 18)) : undefined)

  useEffect(() => {
    if (depositAmount !== undefined && 18 !== undefined) {
      const updatedValue = Number(Number(formatUnits(depositAmount, 18)).toFixed(4))
      setInnerValue(updatedValue)
    }
  }, [depositAmount])

  useEffect(() => {
    const handler = setTimeout(() => {
      const val = innerValue ? toBigInt(Number(innerValue), 18) : undefined
      onValueChange(val)
    }, 500)

    return () => clearTimeout(handler)
  }, [innerValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInnerValue(e.target.value ? Number(e.target.value) : undefined)
  }

  const displayBalanceData = useMemo(() => {
    const formattedBalance = formatBigInt(balance || "0", 18, 2)
    return `${formattedBalance} tan`
  }, [balance])

  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(depositAmount || BigInt(0), 18)) * 0.3
    return val?.toFixed(2) || "-"
  }, [depositAmount])

  return (
    <div
      className={`${isLoading ? "shimmer" : ""} flex h-full w-full items-center justify-center gap-2 rounded-[10px] border border-white border-opacity-20 px-2 py-3 backdrop-blur-[60px]`}
    >
      <div className="flex flex-col">
        <div className="text-xs font-bold text-subtitle">{labelDeposit}</div>

        <div className="text-xl">
          <input
            {...props}
            disabled={isLoading}
            type="number"
            value={innerValue}
            placeholder="Amount"
            onInput={handleInputChange}
            className={cn("min-h-10 rounded-[10px] border-opacity-20 bg-transparent py-2 font-bold focus:outline-none")}
          />
        </div>

        <div className="text-xs text-subtitle">$({dollarDepositDisplay})</div>
      </div>

      <div className="flex h-full flex-col items-center justify-center px-1">
        <div className="flex items-center justify-center rounded-[10px] bg-overlay-panel px-3 py-2 font-bold backdrop-blur-[60px]">
          <IconTan className="mr-3"></IconTan>
          TAN
        </div>
      </div>

      <div className="flex h-full flex-col items-end justify-between">
        <>{depositSelect}</>

        <div className="mt-1 text-xs text-gray-400">
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
      </div>
    </div>
  )
}
