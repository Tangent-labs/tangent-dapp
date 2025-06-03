"use client"

import { IconWallet } from "@/components/icons/icon_wallet"
import PanelRaw from "../structure/panel_raw"
import { AssetDataPriced } from "@/types"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatBigInt, toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
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
  isLoading?: boolean
  isBuying?: boolean
  setIsBuying: (arg: boolean) => void
  percentage?: number
  setPercentage?: (value: number) => void
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
  isBuying = false,
  setIsBuying,
  isLoading = false,
  percentage = 0,
  setPercentage,
  disabled,
  ...props
}: BuySellInputProps) {
  const balanceNumber = useMemo(() => {
    if (depositBalance) {
      return Number(formatUnits(depositBalance, 18))
    }
    return 0
  }, [depositBalance])

  const [isDepositUserInput, setIsDepositUserInput] = useState(false)
  const [isReceiveUserInput, setIsReceiveUserInput] = useState(false)

  const [innerValue, setInnerValue] = useState<number | undefined>(
    depositAmount !== undefined ? Number(formatUnits(depositAmount, depositAsset?.decimals || 0)) : undefined
  )

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!setPercentage) {
      const newPercentage = Number(e.target.value)
      setPercentage(newPercentage)
      const newValue = newPercentage !== 0 ? Number(((newPercentage / 100) * balanceNumber).toFixed(0)) : 0
      setInnerValue(newValue)
      onValueChange(!!newValue ? toBigInt(newValue, 18) : undefined)
    }
  }

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
    const newValue = e.target.value

    setIsDepositUserInput(true)
    setIsReceiveUserInput(false)
    setInnerValue(newValue ? Number(newValue) : undefined)

    if (!!setPercentage) {
      setPercentage(newValue !== undefined && balanceNumber > 0 ? (Number(newValue) / balanceNumber) * 100 : 0)
    }
  }

  const handleInputTangentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReceiveUserInput(true)
    setIsDepositUserInput(false)

    setInnerTangentValue(e.target.value ? Number(e.target.value) : undefined)
  }

  const displayDepositBalanceData = useMemo(() => {
    const formattedBalance = formatBigInt(depositBalance || "0", depositAsset?.decimals || 18, depositAsset?.displayDecimals || 2)
    return formattedBalance
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
      <div className="flex w-full flex-col items-start justify-start font-bold">
        {labelDeposit === "You Buy" ? "Sell" : "Buy"} {receiveAsset?.symbol}
      </div>

      <div className={cn("flex flex-col gap-2")} {...props}>
        <PanelRaw className={`${isLoading ? "shimmer" : ""} flex flex-col gap-1 p-2`}>
          <div className="flex w-full justify-between">
            <div className="text-sm text-gray-400">{labelDeposit}</div>
          </div>
          <div className="mb-2 flex flex-col justify-between lg:flex-row">
            <div className="order-2 mr-4 text-xl lg:order-1">
              <input
                {...props}
                disabled={isLoading || disabled}
                type="number"
                value={innerValue ?? ""}
                placeholder="Amount"
                onChange={handleInputChange}
                className={cn(
                  "min-h-10 rounded-[10px] border-opacity-20 bg-transparent p-2 font-bold focus:outline-none disabled:bg-gray-400 disabled:bg-opacity-30"
                )}
              />
            </div>
            <div className="order-1 lg:order-2">{depositSelect}</div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <div>$({dollarDepositDisplay})</div>

            <div className="flex cursor-pointer items-center">
              <span>{displayDepositBalanceData}</span>
              <IconWallet className="w-6" />

              <div
                onClick={() => {
                  if (setMaxBalance) setMaxBalance()
                }}
              >
                Max.
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
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-black"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${percentage}%, #4b5563 ${percentage}%)`,
            }}
          />

          <div className="flex w-full items-center justify-between text-xs text-subtitle">
            <div className="relative flex w-fit items-center justify-center">
              0%
              <div
                onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "0" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
                className="absolute -top-2.5 left-1 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
              ></div>
            </div>

            {[25, 50, 75].map((el) => (
              <div key={el} className="relative flex w-fit items-center justify-center">
                {el}%
                <div
                  onClick={
                    !!handleSliderChange ? () => handleSliderChange({ target: { value: el.toString() } } as React.ChangeEvent<HTMLInputElement>) : () => {}
                  }
                  className="absolute -top-2.5 left-2 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                ></div>
              </div>
            ))}

            <div className="relative flex w-fit items-center justify-center">
              100%
              <div
                onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "100" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
                className="absolute -top-2.5 right-1 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
              ></div>
            </div>
          </div>
        </PanelRaw>

        <div onClick={() => setIsBuying(!isBuying)} className="flex w-full cursor-pointer items-center justify-center border-none">
          <IconChevron className="h-auto w-8 rounded-lg border border-white/10 p-2 text-row-tonic backdrop-blur-[60px]" />
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
