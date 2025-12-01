"use client"

import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { AssetDataPriced } from "@/types"
import { SliderInput } from "./slider_input"
import BorderPanel from "../structure/border_panel"
import { IconChevron } from "@/components/icons/icon_chevron"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
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
  const inputRef = useRef<HTMLInputElement>(null)

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

  const onClickFocus = () => {
    inputRef.current?.focus()
  }

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
        <BorderPanel onClick={onClickFocus} className={`${isLoading ? "shimmer" : ""} flex cursor-pointer flex-col p-2 hover:bg-white/10`}>
          <div className="flex w-full justify-between">
            <div className="text-sm text-subtitle">{labelDeposit}</div>
          </div>
          <div className="mb-2 flex justify-between">
            <div className="flex items-center justify-start">
              <input
                {...props}
                disabled={disabled}
                type="number"
                value={innerValue ?? ""}
                ref={inputRef}
                placeholder="Amount"
                onChange={handleInputChange}
                className="auto-grow bg-transparent text-[24px] font-semibold focus:outline-none"
              />
              <div className="text-xs text-subtitle">{dollarDepositDisplay}</div>
            </div>

            {depositSelect}
          </div>
          <div className="flex w-full justify-between text-xs text-subtitle">
            <div className="flex w-full cursor-pointer items-center justify-between gap-2">
              <div className="flex w-full flex-col">
                <SliderInput percentage={percentage} handleSliderChange={handleSliderChange}></SliderInput>
              </div>

              <BorderPanel
                className="w-10 min-w-10 cursor-pointer bg-button-active px-1 text-center text-xs text-white hover:font-semibold"
                onClick={() => {
                  if (setMaxBalance) setMaxBalance()
                }}
              >
                Max.
              </BorderPanel>
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
          <IconChevron className="h-auto w-8 rounded-[10px] border border-white border-white/10 border-opacity-20 bg-select-input p-2 text-white backdrop-blur-[60px] hover:border-white hover:stroke-black" />
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
