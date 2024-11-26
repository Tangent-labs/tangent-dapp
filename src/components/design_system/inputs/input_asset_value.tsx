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

interface InputAssetValueProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  className?: string
  value?: bigint
  balance?: bigint
  asset?: AssetDataPriced
  label?: string
  onChange: (value: bigint | undefined) => void
  options?: InputAssetValueOptions
}

const InputAssetValue = ({ value, balance, asset, onChange, options, className, label, ...props }: InputAssetValueProps) => {
  options = {
    ...{
      displayDecimals: asset?.displayDecimals || 0,
      displayLabel: true,
      displayBalance: true,
      displayMax: true,
      displayDollarValue: true,
    },
    ...(options || {}),
  }

  // Debounce
  const [innerValue, setInnverValue] = useState<number | undefined>(!value ? undefined : Number(formatUnits(value || BigInt(0), asset?.decimals || 0)))
  useEffect(() => {
    const handler = setTimeout(() => {
      const val = innerValue ? toBigInt(Number(innerValue), asset?.decimals || 0) : undefined
      onChange(val)
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
    const formattedBalance = formatBigInt(balance || "0", asset?.decimals || 0, options?.displayDecimals || asset?.displayDecimals || 0)
    return `Balance: ${formattedBalance} ${asset?.displaySymbol || asset?.symbol || ""}`
  }, [balance, asset, options])

  /**
   * Handle/Format dollar value
   */
  const dollarValueDisplay = useMemo(() => {
    if (!options?.displayDollarValue) return ""
    const val = formatDollar(Number(formatUnits(value || BigInt(0), asset?.decimals || 0)) * (asset?.price || 0))
    return val && `(${val || "0"})`
  }, [value, asset, options])

  if (!asset?.decimals) {
    return <>no decimals</>
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInnverValue(!e.target.value ? undefined : Number(e.target.value))
  }

  if (!asset) return <></>

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between">
        <label className={`text-xs ${!options?.displayLabel && "sr-only"} `}>{label}</label>
        {options?.displayBalance && <span className={`text-xs text-gray-400`}>{displayBalance}</span>}
      </div>
      <input
        {...props}
        type="number"
        value={innerValue}
        onChange={handleInputChange}
        className="min-h-10 rounded-[10px] border border-white border-opacity-20 bg-transparent p-2 text-xs disabled:bg-gray-400 disabled:bg-opacity-30"
      />
      <div className="text-xs text-gray-400">{dollarValueDisplay}</div>
    </div>
  )
}

export default InputAssetValue
