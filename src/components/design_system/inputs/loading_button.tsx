"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, useRef } from "react"

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  children?: React.ReactNode
  state?: "active" | "inactive" | "disabled"
  isLoading?: boolean
}

export const LoadingButton = ({ label, state = "active", className, disabled, children, isLoading = false, onClick, ...props }: LoadingButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const createRippleEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state !== "active" || isLoading || !buttonRef.current) return

    const btn = buttonRef.current
    const rect = btn.getBoundingClientRect()

    // Max(width and height) / 2 because we have long and thin buttons
    const diameter = Math.max(rect.width, rect.height) / 2
    const radius = diameter / 2

    const x = e.clientX - rect.left - radius
    const y = e.clientY - rect.top - radius

    const ripple = document.createElement("span")

    ripple.className = "absolute z-0 rounded-full pointer-events-none bg-button-active-dark animate-ripple"

    ripple.style.width = ripple.style.height = `${diameter}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    btn.appendChild(ripple)

    setTimeout(() => ripple.remove(), 1500)

    onClick?.(e)
  }

  return (
    <button
      ref={buttonRef}
      {...props}
      onClick={createRippleEffect}
      disabled={state === "inactive" || disabled || isLoading}
      data-state={state}
      className={cn(
        "group relative flex min-w-[120px] items-center justify-center gap-2 overflow-hidden rounded-[10px] p-2 px-4 font-gilroy text-[15px] font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed",
        {
          "bg-button-active hover:bg-button-active-hover": state === "active",
          "bg-button-inactive": state === "inactive",
          "cursor-not-allowed bg-button-inactive": state === "disabled",
        },
        className
      )}
    >
      <span className="relative z-10 flex items-center justify-center">
        <span
          className={cn("absolute -left-6 top-0.5 mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-white/40", !isLoading && "invisible")}
          aria-label={isLoading ? "Loading" : undefined}
        />
        {children || label}
      </span>
    </button>
  )
}
