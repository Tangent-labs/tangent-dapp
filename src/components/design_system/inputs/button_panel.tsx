"use client"

import { cn } from "@/lib/utils"

type ButtonPanelProps = React.HTMLAttributes<HTMLButtonElement>

export function ButtonPanel({ children, className, ...props }: ButtonPanelProps) {
  return (
    <button
      className={cn(className, "rounded-[10px] border border-white border-opacity-25 bg-white bg-opacity-[3%] px-6 py-4 backdrop-blur-[30px]")}
      {...props}
    >
      {children}
    </button>
  )
}
