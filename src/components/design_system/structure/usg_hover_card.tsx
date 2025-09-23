"use client"

import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import React, { ReactNode } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type USGHoverCardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string
  iconClassName?: string
  children: ReactNode
}

export default function USGHoverCard({ children, title, iconClassName }: USGHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button type="button">
          <IconCircleHelp className={iconClassName} />
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
