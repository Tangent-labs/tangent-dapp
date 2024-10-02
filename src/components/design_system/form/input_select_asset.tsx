"use client"

import { ExistingAsset } from "@/types"
import TokenImage from "../structure/token_image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InputSelectProps {
  options: ExistingAsset[]
  onChange: (value: ExistingAsset) => void
  label?: string
  placeholder?: string
  className?: string
  value: ExistingAsset
}

const InputSelectAsset = ({ options, onChange, label, placeholder = "Select an option", className = "", value }: InputSelectProps) => {
  return (
    <>
      <div className={`flex flex-col  gap-1 ${className}`}>
        <div className="flex justify-between text-[12px]">{label}</div>
        <div>
          <Select value={value} onValueChange={(value) => onChange(value as ExistingAsset)}>
            <SelectTrigger className={className}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem value={option} key={option}>
                  {/* Custom HTML for Option 1 */}
                  <div className="flex items-center gap-2 ">
                    <TokenImage token={option} size={25} />
                    <span className="text-[12px]">{option}</span>
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

/* 

<>
      <div className={`flex flex-col  gap-1 ${className}`}>
        <div className="flex justify-between">
          <label className={`text-[12px]  `}>{label}</label>
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
