"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  children?: React.ReactNode
  state?: "active" | "inactive" | "disabled"
  isLoading?: boolean
}

export const LoadingButton = ({ label, state = "active", className, disabled, children, isLoading = false, ...props }: LoadingButtonProps) => {
  return (
    <button
      {...props}
      onClick={state === "active" ? props?.onClick : () => {}}
      disabled={state === "inactive" || disabled || isLoading}
      data-state={state}
      className={cn(
        "flex min-w-[120px] items-center justify-center gap-2 rounded-[10px] p-2 px-4 font-gilroy text-[15px] font-semibold transition-all duration-200 disabled:cursor-not-allowed",
        {
          "bg-button-active hover:bg-button-active-hover": state === "active",
          "bg-button-inactive": state === "inactive",
          "cursor-not-allowed bg-button-inactive": state === "disabled",
        },
        className
      )}
    >
      {children ||
        (label && (
          <span className="relative flex items-center justify-center">
            <span
              className={cn(
                "absolute -left-6 top-0.5 mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-white/40",
                !isLoading && "invisible"
              )}
              aria-label={isLoading ? "Loading" : undefined}
            />
            {label}
          </span>
        ))}
    </button>
  )
}
