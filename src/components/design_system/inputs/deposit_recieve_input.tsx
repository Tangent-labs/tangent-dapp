"use client"

import { AssetDataPriced } from "@/types"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatDollar, toBigInt } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import DisplayReceivePanel from "./display_recieve_panel"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import { IconThunder } from "@/components/icons/icon_thunder"
import BorderPanel from "../structure/border_panel"

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
  isZapping?: boolean
  isLoading?: boolean
  percentage?: number
  setPercentage?: (value: number) => void
  displaySliderInput?: boolean
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
  isZapping = false,
  isLoading = false,
  percentage = 0,
  displaySliderInput = false,
  setPercentage,
  ...props
}: DepositReceiveInputProps) {
  const balanceNumber = useMemo(() => {
    if (balance) {
      return Number(formatUnits(balance, 18))
    }
    return 0
  }, [balance])

  const [innerValue, setInnerValue] = useState<string>(depositAmount !== undefined ? formatUnits(depositAmount, depositAsset?.decimals || 0) : "")
  const [isUserInput, setIsUserInput] = useState(false)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!setPercentage) {
      const newPercentage = Number(e.target.value)
      setPercentage(newPercentage)
      const newValue = newPercentage !== 0 ? Number(((newPercentage / 100) * balanceNumber).toFixed(0)) : 0
      setInnerValue(newValue.toFixed(0))
      onValueChange(!!newValue ? toBigInt(newValue, 18) : undefined)
    }
  }

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
    const newValue = e.target.value
    setIsUserInput(true)
    setInnerValue(newValue)

    if (!!setPercentage) {
      setPercentage(newValue !== undefined && balanceNumber > 0 ? (Number(newValue) / balanceNumber) * 100 : 0)
    }
  }

  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(depositAmount || BigInt(0), depositAsset?.decimals || 0)) * (depositAsset?.price || 0)
    return `(${formatDollar(val)})` || ""
  }, [depositAmount, depositAsset])

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <BorderPanel
        className={`${isLoading ? "shimmer" : ""} flex flex-col bg-white bg-opacity-[3%] p-2 transition-colors duration-200 ease-in-out hover:bg-white/10`}
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
        <div className="mb-2 flex justify-between">
          <div className="text-xl">
            <input
              {...props}
              disabled={isLoading}
              type="number"
              value={innerValue}
              placeholder="Amount"
              onInput={handleInputChange}
              className={cn(
                "min-h-10 rounded-[10px] border-opacity-20 bg-transparent font-semibold focus:outline-none disabled:bg-gray-400 disabled:bg-opacity-30"
              )}
            />
          </div>
          <div className="order-1 lg:order-2">{depositSelect}</div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <div>{dollarDepositDisplay}</div>

          <BorderPanel
            className="flex w-10 cursor-pointer items-center bg-button-active px-1.5 py-0.5 text-xs text-white hover:font-semibold"
            onClick={() => {
              if (setMaxBalance) setMaxBalance()
            }}
          >
            Max.
          </BorderPanel>
        </div>

        {displaySliderInput && (
          <>
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
                  className="absolute -top-1.5 left-1 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                ></div>
              </div>

              {[25, 50, 75].map((el) => (
                <div key={el} className="relative flex w-fit items-center justify-center">
                  {el}%
                  <div
                    onClick={
                      !!handleSliderChange ? () => handleSliderChange({ target: { value: el.toString() } } as React.ChangeEvent<HTMLInputElement>) : () => {}
                    }
                    className="absolute -top-1.5 left-2 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                  ></div>
                </div>
              ))}

              <div className="relative flex w-fit items-center justify-center">
                100%
                <div
                  onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "100" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
                  className="absolute -top-1.5 right-1 h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                ></div>
              </div>
            </div>
          </>
        )}
      </BorderPanel>
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
