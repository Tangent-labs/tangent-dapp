"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SelectOption } from "@/types"
import { ReactNode } from "react"

interface InputSelectProps {
  options?: SelectOption[]
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  value?: string
  template?: (option: SelectOption) => ReactNode
}

const InputSelectAsset = ({ options, onChange, label, placeholder = "Select an option", className = "", value, template }: InputSelectProps) => {
  return (
    <>
      <div className={`flex flex-col  gap-1 ${className}`}>
        <div className="flex justify-between text-xs">{label}</div>
        <div>
          <Select value={value} onValueChange={(value) => onChange(value)}>
            <SelectTrigger className={className}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option: SelectOption) => (
                <SelectItem value={option.value} key={option.value}>
                  {template ? (
                    template(option)
                  ) : (
                    <div className="flex items-center gap-2 ">
                      <span className="text-xs">{option.label}</span>
                    </div>
                  )}
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

/* 

<>
      <div className={`flex flex-col  gap-1 ${className}`}>
        <div className="flex justify-between">
          <label className={`text-xs  `}>{label}</label>
          <select className="bg-transparent border border-white border-opacity-20 rounded-[10px] p-2 ">
            {options.map((option) => (
              <option key={option} value={option}>
                <TokenImage token={option} size={10} />
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
    */
