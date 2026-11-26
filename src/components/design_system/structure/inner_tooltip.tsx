"use client"

import { ButtonHTMLAttributes, ReactNode } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { UI_V2 } from "@/v2/ui"

type InnerTooltipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  innerContent: ReactNode
  children: ReactNode
}

export function InnerTooltip({ children, innerContent }: InnerTooltipProps) {
  return (
    <HoverCard openDelay={50} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side="top"
        className={
          UI_V2
            ? "z-[1001] w-fit rounded-[10px] border border-white/[0.08] bg-raised px-3 py-2.5 font-sans text-xs shadow-pop"
            : "z-[1001] w-full !border-none py-2 text-xs"
        }
      >
        {innerContent}
      </HoverCardContent>
    </HoverCard>
  )
}
