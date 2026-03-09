"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export const PopoverTriggerElement = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} {...props} className={cn("flex w-full items-center justify-center", className)}>
      {children}
    </div>
  )
})
PopoverTriggerElement.displayName = "PopoverTriggerElement"
