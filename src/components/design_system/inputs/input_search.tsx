"use client"

import { IconSearch } from "@/components/icons"

type InputSearchProps = React.ParamHTMLAttributes<HTMLInputElement> & {
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

export const InputSearch = ({ placeholder = "Search...", value, onChange, className = "" }: InputSearchProps) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-[10px] bg-overlay-panel py-1 pl-10 backdrop-blur-[60px] transition-all duration-200 ease-out hover:bg-white/[0.02] focus:bg-white/[0.03] focus:shadow-[0_0_20px_rgba(255,255,255,0.05)] focus:outline-none"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      />
      <IconSearch className="absolute left-3 top-2.5 w-5 text-white/60 transition-colors duration-200"></IconSearch>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 text-white/60 transition-colors duration-200 hover:text-white focus:outline-none"
        >
          &#x2715;
        </button>
      )}
    </div>
  )
}
