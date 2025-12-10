"use client"

import { IconSearch } from "@/components/icons"

type InputSearchProps = React.ParamHTMLAttributes<HTMLInputElement> & {
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

const InputSearch = ({ placeholder = "Search...", value, onChange, className = "" }: InputSearchProps) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-[10px] border-tangent border-white border-opacity-20 bg-overlay-panel py-1 pl-10 backdrop-blur-[60px]"
      />
      <IconSearch className="absolute left-3 top-2.5 w-5"></IconSearch>
      {value && (
        <button type="button" onClick={() => onChange("")} className="absolute right-2 focus:outline-none">
          &#x2715;
        </button>
      )}
    </div>
  )
}

export default InputSearch
