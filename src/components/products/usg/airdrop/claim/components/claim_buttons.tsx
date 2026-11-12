"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

/** Low-emphasis button of the claim airdrop page (Switch wallet, Nothing to claim, Claiming..., Claimed) */
export function GhostButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "flex h-[30px] items-center justify-center gap-1.5 rounded-[10px] bg-white/[0.03] px-4 text-xs font-semibold text-white/70 backdrop-blur-[30px] transition-all duration-200 enabled:hover:bg-white/10 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  )
}
