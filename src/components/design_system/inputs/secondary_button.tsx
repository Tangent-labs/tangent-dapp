"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  children?: React.ReactNode
  state?: "active" | "inactive" | "disabled"
}

export function SecondaryButton({ label, state = "active", className, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      onClick={state === "active" ? props?.onClick : () => {}}
      disabled={state === "inactive" || disabled}
      data-state={state}
      className={cn(
        "flex items-center rounded-[10px] bg-white px-4 py-1 font-gilroy text-[15px] font-semibold text-black transition-all duration-200 disabled:cursor-not-allowed",
        {
          "hover:bg-white/70": state === "active",
        },
        className
      )}
    >
      {children || <span>{label}</span>}
    </button>
  )
}
