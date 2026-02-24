"use client"

import { IconCircleHelp } from "@/components/icons"
import { ReactNode, ButtonHTMLAttributes } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type USGHoverCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string
  iconClassName?: string
  children: ReactNode
}

export function USGHoverCard({ children, title, iconClassName }: USGHoverCardProps) {
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button type="button">
          <IconCircleHelp className={iconClassName} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="z-100 w-fit max-w-56 !border-none text-xs">
        <div className="grid gap-4 !border-none">
          <div className="space-y-2">
            <span className="font-medium leading-none">{title}</span>
            <div>{children}</div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
