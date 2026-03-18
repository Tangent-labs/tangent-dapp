"use client"

import { cn } from "@/lib/utils"
import { createRippleEffect } from "@/lib/animations"
import { ButtonHTMLAttributes, useRef, ReactNode, useEffect, useState } from "react"

type WarningButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  warningType: "warning" | "danger"
  label?: string
  children?: ReactNode
  state?: "active" | "inactive" | "disabled"
  hasLoadingState?: boolean
  isLoading?: boolean
  classNameChild?: string
}

export const WarningButton = ({
  warningType,
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
}: WarningButtonProps) => {
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
        "border-1 relative inline-flex w-full rounded-[11px] p-[1px] [border-image:linear-gradient(0deg,rgba(255,255,255,0)_68.33%,rgba(255,255,255,0.1)_100%)_1]",
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
          "group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[10px] px-4 py-1 font-gilroy text-sm font-semibold disabled:cursor-not-allowed",
          {
            "bg-[#FFE1001A] hover:bg-[#FFE10033]": warningType === "warning",
            "bg-[#FF030033] hover:bg-[#FF03004D]": warningType === "danger",
          },
          classNameChild ? classNameChild : ""
        )}
      >
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

        {children || label}
      </button>
    </div>
  )
}
