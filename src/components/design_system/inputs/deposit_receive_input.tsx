"use client"

import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { AssetDataPriced } from "@/types"
import BorderPanel from "../structure/border_panel"
import DisplayReceivePanel from "./display_recieve_panel"
import { IconChevron } from "@/components/icons/icon_chevron"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatDollar, toBigInt } from "@/lib/number_formatter"

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
  isLoading?: boolean
  percentage?: number
  setPercentage?: (value: number) => void
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
  isLoading = false,
  percentage = 0,
  setPercentage,
  ...props
}: DepositReceiveInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

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

  const onClickFocus = () => {
    inputRef.current?.focus()
  }

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <BorderPanel
        onClick={onClickFocus}
        className={`${isLoading ? "shimmer" : ""} flex cursor-pointer flex-col bg-white bg-opacity-[3%] p-2 transition-colors duration-200 ease-in-out hover:bg-white/10`}
      >
        <div className="text-sm text-subtitle">{labelDeposit}</div>

        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center justify-center">
            <input
              {...props}
              disabled={isLoading}
              type="number"
              ref={inputRef}
              value={innerValue}
              placeholder="Amount"
              onInput={handleInputChange}
              className="auto-grow bg-transparent text-[24px] font-semibold focus:outline-none"
            />
            <div className="text-xs text-subtitle">{dollarDepositDisplay}</div>
          </div>

          <div className="order-1 lg:order-2">{depositSelect}</div>
        </div>

        <div className="flex w-full cursor-pointer items-center gap-2">
          <div className="flex w-full flex-col">
            <input
              type="range"
              min="0"
              step="1"
              max="100"
              value={percentage}
              onChange={handleSliderChange}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#070707]"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${percentage}%, #4b5563 ${percentage}%)`,
              }}
            />

            <div className="flex w-full items-center justify-between text-[10px] text-subtitle">
              <div className="relative flex w-fit items-center justify-center">
                0%
                <div
                  onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "0" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
                  className="absolute -top-1.5 left-1 mt-[1px] h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                ></div>
              </div>

              {[25, 50, 75].map((el) => (
                <div key={el} className="relative flex w-fit items-center justify-center">
                  {el}%
                  <div
                    onClick={
                      !!handleSliderChange ? () => handleSliderChange({ target: { value: el.toString() } } as React.ChangeEvent<HTMLInputElement>) : () => {}
                    }
                    className="absolute -top-1.5 left-2 mt-[1px] h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                  ></div>
                </div>
              ))}

              <div className="relative flex w-fit items-center justify-center">
                100%
                <div
                  onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "100" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
                  className="absolute -top-1.5 right-1 mt-[1px] h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
                ></div>
              </div>
            </div>
          </div>
          <BorderPanel
            className="flex w-10 cursor-pointer items-center bg-button-active px-1 text-xs text-white hover:font-semibold"
            onClick={() => {
              if (setMaxBalance) setMaxBalance()
            }}
          >
            Max.
          </BorderPanel>
        </div>
      </BorderPanel>

      <div className="my-2 flex w-full cursor-pointer items-center justify-center border-none">
        <IconChevron className="h-10 w-10 rounded-[10px] border border-white border-opacity-20 bg-select-input p-3 text-white" />
      </div>

      <DisplayReceivePanel
        labelReceive={labelReceive}
        receiveAmount={receiveAmount}
        receiveAssetDisplay={receiveAssetDisplay}
        receiveDollarValue={receiveDollarValue}
      />
    </div>
  )
}
