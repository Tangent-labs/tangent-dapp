"use client"

import { cn } from "@/lib/utils"
import { createRippleEffect } from "@/lib/animations"
import { ButtonHTMLAttributes, useRef, ReactNode, useEffect, useState } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  children?: ReactNode
  state?: "active" | "inactive" | "disabled"
  hasLoadingState?: boolean
  isLoading?: boolean
  classNameChild?: string
}

export const Button = ({
  label,
  state = "active",
  className,
  classNameChild,
  disabled,
  children,
  onClick,
  hasLoadingState = false,
  isLoading,
  ...props
}: ButtonProps) => {
  const [mounted, setMounted] = useState(false)

  // Use a consistent default during SSR
  const effectiveState = mounted ? state : "inactive"

  useEffect(() => {
    setMounted(true)
  }, [])

  const buttonRef = useRef<HTMLButtonElement>(null)
  const isDisabled = effectiveState !== "active" || disabled

  return (
    <div
      className={cn(
        "relative inline-flex w-full rounded-[11px] p-[1px]",
        effectiveState === "active" ? "bg-gradient-to-b from-[#00C2FF] to-[#00c2ff00]" : "",
        className
      )}
    >
      <button
        {...props}
        ref={buttonRef}
        disabled={isDisabled}
        data-state={effectiveState}
        onClick={(e) => {
          if (isDisabled) return
          createRippleEffect(e, buttonRef)
          onClick?.(e)
        }}
        className={cn(
          "group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[10px] px-4 py-2.5 font-gilroy text-sm font-semibold disabled:cursor-not-allowed",
          {
            "bg-button-active hover:bg-button-active-hover": effectiveState === "active",
            "bg-overlay-panel backdrop-blur-[60px] backdrop-filter": effectiveState !== "active",
            "cursor-not-allowed": effectiveState !== "active",
          },
          classNameChild ? classNameChild : ""
        )}
      >
        {/* Gradient border effect - only visible when inactive */}
        {effectiveState !== "active" && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[10px]"
            style={{
              border: "1px solid transparent",
              background: "linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
              WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        )}

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
