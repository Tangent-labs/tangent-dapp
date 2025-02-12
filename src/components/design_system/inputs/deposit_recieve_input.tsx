"use client"

import { IconWallet } from "@/components/icons/icon_wallet"
import PanelRaw from "../structure/panel_raw"
import { AssetDataPriced } from "@/types"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatBigInt, toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import DisplayReceivePanel from "./display_recieve_panel"

type DepositRecieveInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAsset?: AssetDataPriced
  className?: string
  depositAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  recieveAmount?: string
  recieveDollarValue?: string
  labelRecieve?: string
  depositSelect: ReactNode
  depositInput?: ReactNode
  recieveAssetDisplay?: ReactNode
  onValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  displayRecieve?: boolean
  displayBalance?: boolean
}

export function DepositRecieveInput({
  className,
  depositAmount,
  balance,
  depositAsset,
  recieveAmount,
  recieveDollarValue,
  labelDeposit = "You deposit",
  labelRecieve = "You Stake",
  setMaxBalance,
  onValueChange,
  depositSelect = <></>,
  recieveAssetDisplay = <></>,
  displayRecieve = true,
  displayBalance = true,
  ...props
}: DepositRecieveInputProps) {
  // Debounce

  const [innerValue, setInnverValue] = useState<number | undefined>(
    !depositAmount ? undefined : Number(formatUnits(depositAmount || BigInt(0), depositAsset?.decimals || 0))
  )

  useEffect(() => {
    if (depositAmount !== undefined && depositAsset?.decimals !== undefined) {
      const updatedValue = Number(formatUnits(depositAmount, depositAsset.decimals))
      setInnverValue(updatedValue)
    }
  }, [depositAmount, depositAsset])

  useEffect(() => {
    if (!depositAsset?.decimals) return

    const handler = setTimeout(() => {
      const val = innerValue ? toBigInt(Number(innerValue), depositAsset.decimals) : undefined
      onValueChange(val)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [innerValue, depositAsset])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInnverValue(!e.target.value ? undefined : Number(e.target.value))
  }

  const displayBalanceData = useMemo(() => {
    const formattedBalance = formatBigInt(balance || "0", depositAsset?.decimals || 0, depositAsset?.displayDecimals || 0)
    return `${formattedBalance} ${depositAsset?.symbol || ""} `
  }, [balance, depositAsset])

  /**
   * Handle/Format dollar value
   */
  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(depositAmount || BigInt(0), depositAsset?.decimals || 0)) * (depositAsset?.price || 0)
    return val?.toFixed(2) || "-"
  }, [depositAmount, depositAsset])

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <PanelRaw className="flex flex-col gap-1 p-2">
        <div className="text-sm text-gray-400">{labelDeposit}</div>
        <div className="mb-2 flex flex-col justify-between lg:flex-row">
          <div className="order-2 text-xl lg:order-1">
            <input
              {...props}
              type="number"
              value={innerValue}
              placeholder="Amount"
              onChange={handleInputChange}
              className={cn("min-h-10 rounded-[10px] border-opacity-20 bg-transparent p-2 outline-none disabled:bg-gray-400 disabled:bg-opacity-30")}
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
          labelRecieve={labelRecieve}
          recieveAmount={recieveAmount}
          recieveAssetDisplay={recieveAssetDisplay}
          recieveDollarValue={recieveDollarValue}
        />
      )}
    </div>
  )
}
