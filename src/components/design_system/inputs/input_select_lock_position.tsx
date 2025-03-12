"use client"

import { IconWallet } from "@/components/icons/icon_wallet"
import PanelRaw from "../structure/panel_raw"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatBigInt, toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"

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
  className,
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
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <PanelRaw className={`${isLoading ? "shimmer" : ""} flex flex-col gap-1 p-2`}>
        <div className="text-sm text-gray-400">{labelDeposit}</div>
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
        <div className="flex justify-between text-xs text-gray-400">
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
      </PanelRaw>
    </div>
  )
}
