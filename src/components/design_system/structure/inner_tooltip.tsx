"use client"

import React, { ReactNode } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type InnerTooltipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  innerContent: ReactNode
  children: ReactNode
}

export default function InnerTooltip({ children, innerContent }: InnerTooltipProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side="top" className="z-100 w-full !border-none text-xs">
        {innerContent}
      </HoverCardContent>
    </HoverCard>
  )
}
