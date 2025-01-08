"use client"

import { ExistingAsset } from "@/types"
import TokenImage from "@/components/design_system/structure/token_image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCallback } from "react"

type InputSelectAssetProps = React.ParamHTMLAttributes<HTMLSelectElement> & {
  options: ExistingAsset[]
  onChange: (value: ExistingAsset | string) => void
  label?: string
  placeholder?: string
  className?: string
  value: ExistingAsset | string
  optionValues?: Record<string, string>
}

const InputSelectAsset = ({ options, onChange, label, placeholder = "Select an option", className = "", value, optionValues }: InputSelectAssetProps) => {
  const seletedValue = useCallback((val: string | ExistingAsset) => (optionValues && optionValues[val] ? optionValues[val] : val), [])

  return (
    <>
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="flex justify-between text-xs">{label}</div>
        <div>
          <Select value={value} onValueChange={(val) => onChange(seletedValue(val))}>
            <SelectTrigger className={className}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem value={seletedValue(option)} key={option}>
                  {/* Custom HTML for Option 1 */}
                  <div className="flex items-center gap-2">
                    <TokenImage token={option} size={32} />
                    <span className="text-xs">{option}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}

export default InputSelectAsset
