"use client"

import { IconCircleHelp } from "@/components/icons"
import { ReactNode, ButtonHTMLAttributes } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"

type USGHoverCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string
  iconClassName?: string
  contentClassName?: string
  children: ReactNode
}

export function USGHoverCard({ children, title, iconClassName, contentClassName, className, ...buttonProps }: USGHoverCardProps) {
  return (
    <HoverCard openDelay={50} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button type="button" className={cn("inline-flex items-center", className)} {...buttonProps}>
          <IconCircleHelp className={iconClassName} />
        </button>
      </HoverCardTrigger>

      <HoverCardContent side="top" align="center" className={cn("z-[1001] w-fit max-w-64 text-xs", contentClassName)}>
        <div className="grid gap-3 p-3">
          <span className="font-medium leading-tight">{title}</span>
          <div className="leading-relaxed">{children}</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
