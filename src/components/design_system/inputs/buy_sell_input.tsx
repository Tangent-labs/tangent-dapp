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
  depositAmount?: bigint
  depositBalance?: bigint
  receiveBalance?: bigint
  disabled?: boolean
  labelDeposit?: string
  receiveAmount?: bigint
  labelReceive?: string
  depositSelect: ReactNode
  depositInput?: ReactNode
  receiveSelect?: ReactNode
  onValueChange: (value: bigint | undefined) => void
  onTangentValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  isZapping?: boolean
  isLoading?: boolean
  isBuying?: boolean
  setIsBuying: (arg: boolean) => void
}

export function BuySellInput({
  depositAmount,
  depositBalance,
  receiveBalance,
  depositAsset,
  receiveAsset,
  receiveAmount,
  labelDeposit = "You Sell",
  labelReceive = "You Buy",
  setMaxBalance,
  onValueChange,
  onTangentValueChange,
  depositSelect = <></>,
  receiveSelect = <></>,
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
    if (!isDepositUserInput) {
      if (depositAmount !== undefined && depositAsset?.decimals !== undefined) {
        const updatedValue = Number(Number(formatUnits(depositAmount, depositAsset.decimals)).toFixed(4))
        setInnerValue(updatedValue)
      } else {
        setInnerValue(undefined)
      }
    } else if (!isDepositUserInput && depositAmount === undefined) {
      setInnerValue(undefined)
    }
  }, [depositAmount, depositAsset])

  useEffect(() => {
    if (!isDepositUserInput) return

    const handler = setTimeout(() => {
      const val = innerValue !== undefined ? toBigInt(Number(innerValue), depositAsset?.decimals || 18) : undefined
      onValueChange(val)
    }, 500)

    return () => clearTimeout(handler)
  }, [innerValue, depositAsset])

  const [innerTangentValue, setInnerTangentValue] = useState<number | undefined>(
    receiveAmount !== undefined ? Number(formatUnits(receiveAmount, receiveAsset?.decimals || 18)) : undefined
  )

  useEffect(() => {
    if (!isReceiveUserInput) {
      if (receiveAmount !== undefined && receiveAsset?.decimals !== undefined) {
        const updatedValue = Number(Number(formatUnits(receiveAmount, receiveAsset.decimals)).toFixed(4))
        setInnerTangentValue(updatedValue)
      } else {
        setInnerTangentValue(undefined)
      }
    } else if (!isReceiveUserInput && receiveAmount === undefined) {
      setInnerTangentValue(undefined)
    }
  }, [receiveAmount, receiveAsset])

  useEffect(() => {
    if (!isReceiveUserInput) return

    const handler = setTimeout(() => {
      const val = innerTangentValue !== undefined ? toBigInt(Number(innerTangentValue), receiveAsset?.decimals || 18) : undefined
      onTangentValueChange(val)
    }, 500)

    return () => clearTimeout(handler)
  }, [innerTangentValue, receiveAsset])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDepositUserInput(true)
    setIsReceiveUserInput(false)
    setInnerValue(e.target.value ? Number(e.target.value) : undefined)
  }

  const handleInputTangentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReceiveUserInput(true)
    setIsDepositUserInput(false)

    setInnerTangentValue(e.target.value ? Number(e.target.value) : undefined)
  }

  const displayDepositBalanceData = useMemo(() => {
    const formattedBalance = formatBigInt(depositBalance || "0", depositAsset?.decimals || 18, depositAsset?.displayDecimals || 2)
    return `${formattedBalance} ${depositAsset?.symbol || ""}`
  }, [depositBalance, depositAsset])

  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(depositAmount || BigInt(0), depositAsset?.decimals || 0)) * (depositAsset?.price || 0)
    return val?.toFixed(2) || "-"
  }, [depositAmount, depositAsset])

  const displayReceiveBalanceData = useMemo(() => {
    const formattedBalance = formatBigInt(receiveBalance || "0", receiveAsset?.decimals || 18, receiveAsset?.displayDecimals || 2)
    return `${formattedBalance} ${receiveAsset?.symbol || ""}`
  }, [receiveBalance, receiveAsset])

  const dollarReceiveDisplay = useMemo(() => {
    const val = Number(formatUnits(receiveAmount || BigInt(0), receiveAsset?.decimals || 0)) * (receiveAsset?.price || 0)
    return val?.toFixed(2) || "-"
  }, [receiveAmount, receiveAsset])

  return (
    <div className="flex flex-col gap-2">
      <div className="mt-6 flex w-full flex-col items-start justify-start font-bold">
        {labelDeposit === "You Buy" ? "Sell" : "Buy"} {receiveAsset?.symbol}
      </div>

      <div className={cn("flex flex-col gap-2")} {...props}>
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
            <div className="order-2 mr-4 text-xl lg:order-1">
              <input
                {...props}
                disabled={isLoading}
                type="number"
                value={innerValue ?? ""} // Convert undefined to empty string for input
                placeholder="Amount"
                onChange={handleInputChange} // Use onChange instead of onInput for consistency
                className={cn(
                  "min-h-10 rounded-[10px] border-opacity-20 bg-transparent p-2 font-bold focus:outline-none disabled:bg-gray-400 disabled:bg-opacity-30"
                )}
              />
            </div>
            <div className="order-1 lg:order-2">{depositSelect}</div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <div>$({dollarDepositDisplay})</div>
            <button
              className="flex cursor-pointer items-center"
              type="button"
              onClick={() => {
                if (setMaxBalance) setMaxBalance()
              }}
            >
              <span>{displayDepositBalanceData}</span>
              <IconWallet className="w-6" />
            </button>
          </div>
        </PanelRaw>

        <div onClick={() => setIsBuying(!isBuying)} className="flex w-full cursor-pointer items-center justify-center border-none">
          <IconChevron className="h-auto w-8 rounded-lg border border-white/10 bg-opacity-[3%] p-2 text-row-tonic backdrop-blur-[30px]" />
        </div>

        <PanelRaw className={`${isLoading ? "shimmer" : ""} flex flex-col gap-1 p-2`}>
          <div className="text-sm text-gray-400">{labelReceive}</div>
          <div className="mb-2 flex justify-between">
            <div className="mr-4 text-xl font-medium">
              <input
                disabled={isLoading}
                type="number"
                value={innerTangentValue ?? ""}
                placeholder="Amount"
                onChange={handleInputTangentChange}
                className={cn(
                  "min-h-10 rounded-[10px] border-opacity-20 bg-transparent p-2 font-bold focus:outline-none disabled:bg-gray-400 disabled:bg-opacity-30"
                )}
              />
            </div>
            <div>{receiveSelect}</div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <div>$({dollarReceiveDisplay})</div>
            <button
              className="flex cursor-pointer items-center"
              type="button"
              onClick={() => {
                if (setMaxBalance) setMaxBalance()
              }}
            >
              <span>{displayReceiveBalanceData}</span>
              <IconWallet className="w-6" />
            </button>
          </div>
        </PanelRaw>
      </div>
    </div>
  )
}
