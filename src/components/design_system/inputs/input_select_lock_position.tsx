"use client"

import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import BorderPanel from "../structure/border_panel"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatDisplayValue, formatDollar, toBigInt } from "@/lib/number_formatter"

type InputSelectLockPositionProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string
  depositAmount?: bigint
  balance?: bigint
  disabled?: boolean
  labelDeposit?: string
  depositSelect: ReactNode
  assetSelect: ReactNode
  depositAsset?: AssetDataPriced | CollateralInfo
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
  assetSelect = <></>,
  depositAsset,
  displayBalance = true,
  isLoading = false,
  ...props
}: InputSelectLockPositionProps) => {
  const [percentage, setPercentage] = useState<number>(0)

  const balanceNumber = useMemo(() => {
    if (balance) {
      return Number(formatUnits(balance, depositAsset?.decimals || 18))
    }
    return 0
  }, [balance, depositAsset])

  const [innerValue, setInnerValue] = useState<string>(depositAmount !== undefined ? formatUnits(depositAmount, depositAsset?.decimals || 18) : "")
  const [isUserInput, setIsUserInput] = useState(false)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!setPercentage) {
      const newPercentage = Number(e.target.value)
      setPercentage(newPercentage)
      const newValue = newPercentage === 100 ? balanceNumber : Number(((newPercentage / 100) * balanceNumber).toFixed(0))
      setInnerValue(formatDisplayValue(newValue))
      onValueChange(!!newValue ? toBigInt(newValue, depositAsset?.decimals || 18) : undefined)
    }
  }

  useEffect(() => {
    if (depositAmount !== undefined && depositAsset?.decimals !== undefined) {
      const updatedValue = formatUnits(depositAmount, depositAsset.decimals)
      setInnerValue(formatDisplayValue(updatedValue))
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
    const newValue = e.target.value
    setIsUserInput(true)
    setInnerValue(formatDisplayValue(newValue))

    if (!!setPercentage) {
      setPercentage(newValue !== "" && balanceNumber > 0 ? (Number(newValue) / balanceNumber) * 100 : 0)
    }
  }

  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(depositAmount || BigInt(0), depositAsset?.decimals || 18)) * (depositAsset?.price || 0)
    return `${formatDollar(val)}`
  }, [depositAmount, depositAsset])

  return (
    <BorderPanel className={`${isLoading ? "shimmer" : ""} flex w-full flex-col items-center justify-center p-2 backdrop-blur-[60px]`}>
      <div className="mb-2 flex h-full w-full justify-between">
        <div className="flex w-full max-w-32 flex-col items-start justify-between">
          <div className="text-xs font-semibold text-subtitle">{labelDeposit}</div>

          <div className="text-xl">
            <input
              {...props}
              disabled={isLoading}
              type="number"
              value={innerValue !== undefined ? innerValue : ""}
              placeholder="Amount"
              onInput={handleInputChange}
              className={cn("min-h-8 rounded-[10px] border-opacity-20 bg-transparent font-semibold focus:outline-none")}
            />
          </div>

          <div className="text-xs text-subtitle">{dollarDepositDisplay}</div>
        </div>

        <div className="mr-2 flex h-full w-full max-w-32 flex-col items-start justify-start">
          <span className="mb-1 text-xs font-semibold text-subtitle">Select asset</span>

          <>{assetSelect}</>
        </div>

        <div className="flex h-full flex-col items-end justify-between">
          <>{depositSelect}</>

          <div className="mt-1 text-xs text-gray-400">
            {displayBalance && (
              <div className="flex cursor-pointer items-center">
                <BorderPanel
                  className="flex w-10 cursor-pointer items-center bg-button-active px-1.5 py-0.5 text-xs text-white hover:font-semibold"
                  onClick={() => {
                    if (setMaxBalance) setMaxBalance()
                  }}
                >
                  Max.
                </BorderPanel>
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
    </BorderPanel>
  )
}
