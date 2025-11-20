"use client"

import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { AssetDataPriced } from "@/types"
import BorderPanel from "../structure/border_panel"
import { IconChevron } from "@/components/icons/icon_chevron"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { formatBigInt, formatDollar, toBigInt } from "@/lib/number_formatter"

type BuySellInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  depositAsset?: AssetDataPriced
  receiveAsset?: AssetDataPriced
  depositAmount?: bigint
  depositBalance?: bigint
  disabled?: boolean
  labelDeposit?: string
  receiveAmount?: bigint
  labelReceive?: string
  depositSelect: ReactNode
  depositInput?: ReactNode
  receiveSelect?: ReactNode
  onValueChange: (value: bigint | undefined) => void
  onReceiveValueChange: (value: bigint | undefined) => void
  setMaxBalance: () => void
  isLoading?: boolean
  isBuying?: boolean
  setIsBuying: (arg: boolean) => void
  percentage?: number
  setPercentage?: (value: number) => void
  toggleTokensSwitch: () => void
}

export function BuySellInput({
  depositAmount,
  depositBalance,
  depositAsset,
  receiveAsset,
  receiveAmount,
  labelDeposit = "You Sell",
  labelReceive = "You Buy",
  setMaxBalance,
  onValueChange,
  onReceiveValueChange,
  depositSelect = <></>,
  receiveSelect = <></>,
  isBuying = false,
  setIsBuying,
  isLoading = false,
  percentage = 0,
  setPercentage,
  toggleTokensSwitch,
  disabled,
  ...props
}: BuySellInputProps) {
  const balanceNumber = useMemo(() => {
    if (depositBalance) {
      return Number(formatUnits(depositBalance, depositAsset?.decimals || 18))
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
      onValueChange(!!newValue ? toBigInt(newValue, depositAsset?.decimals || 18) : undefined)
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
      onReceiveValueChange(val)
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

  const dollarDepositDisplay = useMemo(() => {
    const val = Number(formatUnits(depositAmount || BigInt(0), depositAsset?.decimals || 0)) * (depositAsset?.price || 0)
    return `(${formatDollar(val)})`
  }, [depositAmount, depositAsset])

  const dollarReceiveDisplay = useMemo(() => {
    const val = Number(formatUnits(receiveAmount || BigInt(0), receiveAsset?.decimals || 0)) * (receiveAsset?.price || 0)
    return `(${formatDollar(val)})`
  }, [receiveAmount, receiveAsset])

  return (
    <div className="flex w-full flex-col">
      <div className="mb-3 flex w-full items-end justify-between">
        <div className="font-semibold">
          {labelDeposit === "You Buy" ? "Sell" : "Buy"} {receiveAsset?.symbol}
        </div>

        <span className="text-xs text-subtitle">
          Max: {formatBigInt(depositBalance, depositAsset?.decimals || 18, 2)} {depositAsset?.symbol}
        </span>
      </div>

      <div className={cn("flex flex-col")} {...props}>
        <BorderPanel className={`${isLoading ? "shimmer" : ""} flex flex-col p-2 hover:bg-white/10`}>
          <div className="flex w-full justify-between">
            <div className="text-sm text-subtitle">{labelDeposit}</div>
          </div>
          <div className="mb-2 flex w-full justify-between">
            <input
              {...props}
              disabled={disabled}
              type="number"
              value={innerValue ?? ""}
              placeholder="Amount"
              onChange={handleInputChange}
              className={cn(
                "min-h-10 max-w-28 rounded-[10px] border-opacity-20 bg-transparent text-xl font-semibold focus:outline-none disabled:bg-gray-400 disabled:bg-opacity-30 md:max-w-32"
              )}
            />

            {depositSelect}
          </div>
          <div className="flex justify-between text-xs text-subtitle">
            <div>{dollarDepositDisplay}</div>

            <div className="flex cursor-pointer items-center">
              <BorderPanel
                className="flex w-10 cursor-pointer items-center rounded-full bg-button-active px-1.5 py-0.5 text-xs text-white hover:font-semibold"
                onClick={() => {
                  if (setMaxBalance) setMaxBalance()
                }}
              >
                Max.
              </BorderPanel>
            </div>
          </div>

          <input
            type="range"
            min="0"
            step="1"
            max="100"
            value={percentage}
            onChange={handleSliderChange}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#070707]"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${percentage}%, #4b5563 ${percentage}%)`,
            }}
          />

          <div className="flex w-full items-center justify-between text-[10px] text-subtitle">
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
        </BorderPanel>

        <div
          onClick={() => {
            toggleTokensSwitch()
            setIsBuying(!isBuying)
          }}
          className="my-2 flex w-full cursor-pointer items-center justify-center border-none"
        >
          <IconChevron className="h-auto w-8 rounded-lg border border-white border-white/10 border-opacity-20 bg-select-input p-2 text-white backdrop-blur-[60px] hover:border-white hover:stroke-black" />
        </div>

        <BorderPanel className={`${isLoading ? "shimmer" : ""} flex flex-col p-2 hover:bg-white/10`}>
          <div className="text-sm text-subtitle">{labelReceive}</div>
          <div className="mb-2 flex justify-between">
            <div className="mr-4 text-xl font-medium">
              <input
                type="number"
                value={innerTangentValue ?? ""}
                placeholder="Amount"
                onChange={handleInputTangentChange}
                className={cn(
                  "min-h-10 max-w-28 rounded-[10px] border-opacity-20 bg-transparent font-semibold focus:outline-none disabled:bg-gray-400 disabled:bg-opacity-30 md:max-w-32"
                )}
              />
            </div>
            <div>{receiveSelect}</div>
          </div>
          <div className="flex justify-between text-xs text-subtitle">
            <div>{dollarReceiveDisplay}</div>
          </div>
        </BorderPanel>
      </div>
    </div>
  )
}
