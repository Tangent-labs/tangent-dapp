"use client"
import { formatBigInt, formatDollar, toBigInt } from "@/lib/formatter"
import { useMemo } from "react"

type InputAssetValueData = {
  value?: bigint
  decimals: number // Maximum number of decimal places allowed
  maxValue?: bigint
  balance?: bigint
  assetName: string
  dollarValue?: number
}

type InputAssetValueOptions = {
  displayDecimals?: number
  displayLabel?: boolean
  displayBalance?: boolean
  displayMax?: boolean
  displayDollarValue?: boolean
}

interface InputAssetValueProps {
  className?: string
  data: InputAssetValueData
  label?: string
  onChange: (value: bigint) => void
  options: InputAssetValueOptions
}

const InputAssetValue = ({ data, onChange, options, className, label }: InputAssetValueProps) => {
  const displayValue = useMemo(() => {
    return formatBigInt(data.value, data.decimals, options.displayDecimals || data.decimals)
  }, [data?.value])

  const displayBalance = useMemo(() => {
    if (!options?.displayBalance) return ""
    const formattedBalance = formatBigInt(data?.balance || "0", data.decimals, options.displayDecimals || data.decimals)
    return `Balance: ${formattedBalance} ${data?.assetName || ""}`
  }, [data?.balance, data?.assetName])

  const dollarValueDisplay = useMemo(() => {
    if (!options?.displayDollarValue) return ""
    const val = formatDollar(data?.dollarValue)
    return val && `(${val || "0"})`
  }, [data?.dollarValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(toBigInt(Number(e.target.value || 0), data.decimals))
  }
  const placeholder = `0.${"0".repeat(options.displayDecimals || data.decimals)}`
  return (
    <div className={`flex flex-col  gap-1 ${className}`}>
      <div className="flex justify-between">
        <label className={`text-[12px] ${!options?.displayLabel && "sr-only"} `}>{label}</label>
        {options.displayBalance && <span className={`text-[12px] text-gray-400  `}>{displayBalance}</span>}
      </div>
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        className="min-h-10 bg-transparent border border-white border-opacity-20 rounded-[10px] p-2 text-[12px] "
        placeholder={placeholder}
      />
      <div className="text-[12px] text-gray-400">{dollarValueDisplay}</div>
    </div>
  )
}

export default InputAssetValue
