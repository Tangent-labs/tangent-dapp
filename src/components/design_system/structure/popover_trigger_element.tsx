"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
  className?: string
}

export function PopoverTriggerElement({ children, className, ...props }: ButtonProps) {
  return (
    <button {...props} className={cn("flex items-center justify-center", className)}>
      {children}
    </button>
  )
}
