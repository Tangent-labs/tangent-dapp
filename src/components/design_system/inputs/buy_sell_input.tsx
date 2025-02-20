"use client"

import { IconWallet } from "@/components/icons/icon_wallet"
import PanelRaw from "../structure/panel_raw"
import { AssetDataPriced } from "@/types"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatBigInt, toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import { IconThunder } from "@/components/icons/icon_thunder"
import { IconChevron } from "@/components/icons/icon_chevron"

type BuySellInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAsset?: AssetDataPriced
  receiveAsset?: AssetDataPriced
  className?: string
  depositAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  receiveAmount?: bigint
  receiveDollarValue?: string
  labelReceive?: string
  depositSelect: ReactNode
  depositInput?: ReactNode
  receiveAssetDisplay?: ReactNode
  onValueChange: (value: bigint | undefined) => void
  onTangentValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  displayBalance?: boolean
  isZapping?: boolean
  isLoading?: boolean
  isBuying?: boolean
  setIsBuying: (arg: boolean) => void
}

export function BuySellInput({
  className,
  depositAmount,
  balance,
  depositAsset,
  receiveAsset,
  receiveAmount,
  receiveDollarValue,
  labelDeposit = "You Sell",
  labelReceive = "You Buy",
  setMaxBalance,
  onValueChange,
  onTangentValueChange,
  depositSelect = <></>,
  receiveAssetDisplay = <></>,
  displayBalance = true,
  isZapping = false,
  isBuying = false,
  setIsBuying,
  isLoading = false,
  ...props
}: BuySellInputProps) {
  const [isDepositUserInput, setIsDepositUserInput] = useState(false)

  const [isReceiveUserInput, setIsReceiveUserInput] = useState(false)

  const [innerValue, setInnerValue] = useState<number | undefined>(
    depositAmount !== undefined ? Number(formatUnits(depositAmount, depositAsset?.decimals || 0)) : undefined
  )

  useEffect(() => {
    if (depositAmount !== undefined && depositAsset?.decimals !== undefined) {
      const updatedValue = Number(Number(formatUnits(depositAmount, depositAsset.decimals)).toFixed(4))
      setInnerValue(updatedValue)
      setIsDepositUserInput(false)
    }
  }, [depositAmount, depositAsset])

  useEffect(() => {
    if (!isDepositUserInput) return

    const handler = setTimeout(() => {
      const val = innerValue ? toBigInt(Number(innerValue), 18) : undefined
      onValueChange(val)
    }, 500)

    return () => clearTimeout(handler)
  }, [innerValue, depositAsset, isDepositUserInput])

  //
  //
  const [innerTangentValue, setInnerTangentValue] = useState<number | undefined>(
    receiveAmount !== undefined ? Number(formatUnits(receiveAmount, 18)) : undefined
  )

  useEffect(() => {
    if (receiveAmount !== undefined) {
      const updatedValue = Number(Number(formatUnits(receiveAmount, 18)).toFixed(4))
      setInnerTangentValue(updatedValue)
      setIsReceiveUserInput(false)
    }
  }, [receiveAmount, receiveAsset])

  useEffect(() => {
    if (!isReceiveUserInput) return

    const handler = setTimeout(() => {
      const val = innerTangentValue ? toBigInt(Number(innerTangentValue), 18) : undefined
      onTangentValueChange(val)
    }, 500)

    return () => clearTimeout(handler)
  }, [innerTangentValue, receiveAsset, isReceiveUserInput])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDepositUserInput(true)
    setInnerValue(e.target.value ? Number(e.target.value) : undefined)
  }

  const handleInputTangentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReceiveUserInput(true)
    setInnerTangentValue(e.target.value ? Number(e.target.value) : undefined)
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

      <PanelRaw onClick={() => setIsBuying(!isBuying)} className="flex w-full cursor-pointer items-center justify-center border-none">
        <IconChevron className="h-auto w-8 rounded-lg border border-white/10 p-2 text-row-tonic" />
      </PanelRaw>

      <PanelRaw className="flex flex-col gap-1 !bg-opacity-20 p-2">
        <div className="text-sm text-gray-400">{labelReceive}</div>
        <div className="mb-2 flex justify-between">
          <div className="text-xl font-medium">
            <input
              disabled={isLoading}
              type="number"
              value={innerTangentValue}
              placeholder="Amount"
              onInput={handleInputTangentChange}
              className={cn(
                "min-h-10 rounded-[10px] border-opacity-20 bg-transparent p-2 font-bold focus:outline-none disabled:bg-gray-400 disabled:bg-opacity-30"
              )}
            />
          </div>
          <div>{receiveAssetDisplay}</div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <div>$({receiveDollarValue})</div>
        </div>
      </PanelRaw>
    </div>
  )
}
