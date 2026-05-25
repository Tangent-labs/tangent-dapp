"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { MobileMenuModal } from "./mobile_menu_modal"

export const FeatureSelect = ({
  value,
  onChange,
  options,
  title,
}: {
  value: string
  onChange: (f: string) => void
  options: Array<{ key: string; value: string; disabled?: boolean }>
  title?: string
}) => {
  const [open, setOpen] = useState(false)

  const label = options.find((option) => option.key.toLowerCase() === value.toLowerCase())?.value ?? options[0].value

  return (
    <>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="relative flex w-full items-center justify-center rounded-[10px] bg-white px-4 py-1 font-gilroy text-sm font-semibold text-black transition-all duration-200 hover:bg-white/70"
      >
        <span>{label}</span>
        <ChevronDown className="absolute right-4 h-5 w-5" />
      </button>

      <MobileMenuModal open={open} onClose={() => setOpen(false)} title={title ?? "Menu"}>
        <div role="listbox" aria-label={title ?? "Menu"} className="flex flex-col gap-2">
          {options.map((opt) => {
            const isActive = opt.key.toLowerCase() === value.toLowerCase()
            return (
              <button
                key={opt.key}
                type="button"
                role="option"
                aria-selected={isActive}
                aria-disabled={opt.disabled}
                onClick={() => {
                  if (opt.disabled) return
                  onChange(opt.key)
                  setOpen(false)
                }}
                className={cn(
                  "h-10 w-full rounded-[10px] text-center font-gilroy text-[15px] font-semibold transition-colors duration-200",
                  isActive ? "bg-button-active text-white" : "border border-white/20 bg-transparent text-subtitle hover:bg-white/10 hover:text-white",
                  opt.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-subtitle"
                )}
              >
                {opt.value}
              </button>
            )
          })}
        </div>
      </MobileMenuModal>
    </>
  )
}
