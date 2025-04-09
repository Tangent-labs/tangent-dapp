"use client"

import { IconWallet } from "@/components/icons/icon_wallet"
import PanelRaw from "../structure/panel_raw"
import { AssetDataPriced } from "@/types"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatBigInt, toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import DisplayReceivePanel from "./display_recieve_panel"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import { IconThunder } from "@/components/icons/icon_thunder"

type DepositReceiveInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAsset?: AssetDataPriced
  className?: string
  depositAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  receiveAmount?: string
  receiveDollarValue?: string
  labelReceive?: string
  depositSelect: ReactNode
  depositInput?: ReactNode
  receiveAssetDisplay?: ReactNode
  onValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  displayRecieve?: boolean
  displayBalance?: boolean
  isZapping?: boolean
  isLoading?: boolean
}

export function DepositReceiveInput({
  className,
  depositAmount,
  balance,
  depositAsset,
  receiveAmount,
  receiveDollarValue,
  labelDeposit = "You Deposit",
  labelReceive = "You Stake",
  setMaxBalance,
  onValueChange,
  depositSelect = <></>,
  receiveAssetDisplay = <></>,
  displayRecieve = true,
  displayBalance = true,
  isZapping = false,
  isLoading = false,
  ...props
}: DepositReceiveInputProps) {
  const [innerValue, setInnerValue] = useState<string>(depositAmount !== undefined ? formatUnits(depositAmount, depositAsset?.decimals || 0) : "")
  const [isUserInput, setIsUserInput] = useState(false)

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
    setIsUserInput(true)
    setInnerValue(e.target.value)
  }

  const displayBalanceData = useMemo(() => {
    const formattedBalance = formatBigInt(balance || "0", depositAsset?.decimals || 18, depositAsset?.displayDecimals || 2)
    return `${formattedBalance} ${depositAsset?.symbol || ""}`
  }, [balance, depositAsset])

  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(depositAmount || BigInt(0), depositAsset?.decimals || 0)) * (depositAsset?.price || 0)
    return val?.toFixed(2) || "-"
  }, [depositAmount, depositAsset])

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <PanelRaw className={`${isLoading ? "shimmer" : ""} flex flex-col gap-1 p-2`}>
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
      {displayRecieve && (
        <DisplayReceivePanel
          labelReceive={labelReceive}
          receiveAmount={receiveAmount}
          receiveAssetDisplay={receiveAssetDisplay}
          receiveDollarValue={receiveDollarValue}
        />
      )}
    </div>
  )
}
