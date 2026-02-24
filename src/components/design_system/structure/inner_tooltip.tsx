"use client"

import { ButtonHTMLAttributes, ReactNode } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type InnerTooltipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  innerContent: ReactNode
  children: ReactNode
}

export function InnerTooltip({ children, innerContent }: InnerTooltipProps) {
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side="top" className="z-100 w-full !border-none text-xs">
        {innerContent}
      </HoverCardContent>
    </HoverCard>
  )
}
