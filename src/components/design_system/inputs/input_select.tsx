"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SelectOption, SelectOptionAmount } from "@/types"
import { ReactNode } from "react"

interface InputSelectProps<T extends SelectOption | SelectOptionAmount> {
  options?: T[]
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  value?: string
  disabled?: boolean
  template?: (option: T) => ReactNode // Template matches the type of options
}

export const InputSelectAmountTemplate = (option: SelectOptionAmount) => {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm">{option.label}</span>
      <span className="text-xs text-subtitle">{option.amountDisplay && `(${option.amountDisplay})`}</span>
    </div>
  )
}

const InputSelect = <T extends SelectOption | SelectOptionAmount>({
  options,
  onChange,
  label,
  placeholder = "Select an option",
  className = "",
  value,
  template,
  disabled,
}: InputSelectProps<T>) => {
  return (
    <>
      <div className={`flex flex-col ${className}`}>
        <div className="mb-1 flex justify-between text-xs font-semibold text-subtitle">{label}</div>

        <Select disabled={disabled} value={value} onValueChange={(value) => onChange(value)}>
          <SelectTrigger disabled={disabled} className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option: SelectOption) => (
              <SelectItem value={option.value} key={option.value}>
                {template ? (
                  template(option as T)
                ) : (
                  <div className="flex items-center">
                    <span className="text-[14px] font-semibold">{option.label}</span>
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

export default InputSelect
