"use client"
import { useEffect, useState } from "react"
import { formatBigInt, formatDollar, toBigInt } from "@/lib/number_formatter"
import { AssetDataPriced } from "@/types"
import { useMemo } from "react"
import { formatUnits } from "viem"

type InputAssetValueOptions = {
  displayDecimals?: number
  displayLabel?: boolean
  displayBalance?: boolean
  displayMax?: boolean
  displayDollarValue?: boolean
}

interface InputAssetValueProps {
  className?: string
  value?: bigint
  balance?: bigint
  asset: AssetDataPriced
  label?: string
  onChange: (value: bigint) => void
  options: InputAssetValueOptions
}

export const inputAssetValueFullOption = (displayDecimals: number): InputAssetValueOptions => {
  return {
    displayDecimals,
    displayLabel: true,
    displayBalance: true,
    displayMax: true,
    displayDollarValue: true,
  }
}

const InputAssetValue = ({ value, balance, asset, onChange, options, className, label }: InputAssetValueProps) => {
  // Debounce
  const [innerValue, setInnverValue] = useState<number>(Number(formatUnits(value || BigInt(0), asset.decimals)))
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(toBigInt(Number(innerValue || 0), asset.decimals))
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [innerValue, asset])

  /**
   * Handle/Format balance
   */
  const displayBalance = useMemo(() => {
    if (!options?.displayBalance) return ""
    const formattedBalance = formatBigInt(balance || "0", asset.decimals, options.displayDecimals || asset.decimals)
    return `Balance: ${formattedBalance} ${asset?.symbol || ""}`
  }, [balance, asset, options])

  /**
   * Handle/Format dollar value
   */
  const dollarValueDisplay = useMemo(() => {
    if (!options?.displayDollarValue) return ""
    const val = formatDollar(Number(formatUnits(value || BigInt(0), asset?.decimals)) * asset?.price)
    return val && `(${val || "0"})`
  }, [value, asset, options])

  if (!asset?.decimals) {
    return <>no decimals</>
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInnverValue(Number(e.target.value))
  }
  const placeholder = `#.${"0".repeat(options.displayDecimals || asset.decimals)}`
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between">
        <label className={`text-xs ${!options?.displayLabel && "sr-only"} `}>{label}</label>
        {options.displayBalance && <span className={`text-xs text-gray-400`}>{displayBalance}</span>}
      </div>
      <input
        type="number"
        value={innerValue}
        onChange={handleInputChange}
        className="min-h-10 rounded-[10px] border border-white border-opacity-20 bg-transparent p-2 text-xs"
        placeholder={placeholder}
      />
      <div className="text-xs text-gray-400">{dollarValueDisplay}</div>
    </div>
  )
}

export default InputAssetValue
