"use client"

import { cn } from "@/lib/utils"

type ButtonPanelProps = React.HTMLAttributes<HTMLButtonElement>

export function ButtonPanel({ children, className, ...props }: ButtonPanelProps) {
  return (
    <button className={cn(className, "rounded-[10px] border border-white border-opacity-20 bg-overlay-panel px-6 py-4 backdrop-blur-[60px]")} {...props}>
      {children}
    </button>
  )
}
