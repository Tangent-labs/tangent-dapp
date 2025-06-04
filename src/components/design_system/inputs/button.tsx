"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  children?: React.ReactNode
  state?: "active" | "inactive" | "disabled"
}

export function Button({ label, state = "active", className, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      onClick={props?.onClick}
      disabled={state === "inactive" || disabled}
      data-state={state}
      className={cn(
        "flex items-center rounded-[10px] p-2 px-4 font-sans text-[15px] font-semibold transition-all duration-300 disabled:cursor-not-allowed",
        {
          "bg-button-active hover:bg-button-active-hover": state === "active",
          "bg-button-inactive": state === "inactive",
          "cursor-not-allowed bg-button-inactive": state === "disabled",
        },
        className
      )}
    >
      {children || <span>{label}</span>}
    </button>
  )
}
