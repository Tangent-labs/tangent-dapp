"use client"

import { IconCircleHelp } from "@/components/icons"
import React, { ReactNode } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type USGHoverCardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string
  children: ReactNode
}

export default function USGHoverCard({ children, title }: USGHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button type="button">
          <IconCircleHelp />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="z-50 w-fit max-w-80 !border-none text-xs">
        <div className="grid gap-4 !border-none">
          <div className="space-y-2">
            <span className="font-medium leading-none">{title}</span>
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
