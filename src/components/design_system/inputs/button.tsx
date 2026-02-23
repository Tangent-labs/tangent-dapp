"use client"

import { cn } from "@/lib/utils"
import React, { ButtonHTMLAttributes, useRef } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  children?: React.ReactNode
  state?: "active" | "inactive" | "disabled"
  hasLoadingState?: boolean
  isLoading?: boolean
}

export const Button = ({ label, state = "active", className, disabled, children, onClick, hasLoadingState = false, isLoading, ...props }: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const createRippleEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state !== "active" || !buttonRef.current) return

    const btn = buttonRef.current
    const rect = btn.getBoundingClientRect()

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
  }

  const isDisabled = state !== "active" || disabled

  return (
    <div
      className={cn(
        "relative inline-flex w-full rounded-[11px] p-[1px]",
        state === "active" ? "bg-gradient-to-b from-[rgba(0,194,255,0.5)] to-[#00c2ff00]" : "",
        className
      )}
    >
      <button
        {...props}
        ref={buttonRef}
        disabled={isDisabled}
        data-state={state}
        onClick={(e) => {
          if (isDisabled) return
          createRippleEffect(e)
          onClick?.(e)
        }}
        className={cn(
          "group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[10px] px-4 py-2 font-gilroy text-[15px] font-semibold disabled:cursor-not-allowed",
          {
            "bg-button-active hover:bg-button-active-hover": state === "active",
            "bg-button-inactive": state !== "active",
            "cursor-not-allowed": state !== "active",
          }
        )}
      >
        {hasLoadingState ? (
          <span className="relative z-10 flex items-center justify-center">
            <span
              className={cn(
                "absolute -left-6 top-0.5 mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-white/40",
                !isLoading && "invisible"
              )}
              aria-label={isLoading ? "Loading" : undefined}
            />
            {children || label}
          </span>
        ) : (
          <>{children || label}</>
        )}
      </button>
    </div>
  )
}
