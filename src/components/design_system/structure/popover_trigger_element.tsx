"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

type PopoverTriggerElementProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
  className?: string
}

export const PopoverTriggerElement = forwardRef<HTMLButtonElement, PopoverTriggerElementProps>(({ children, className, ...props }, ref) => {
  return (
    <button ref={ref} {...props} className={cn("flex w-full items-center justify-center", className)}>
      {children}
    </button>
  )
})
PopoverTriggerElement.displayName = "PopoverTriggerElement"
