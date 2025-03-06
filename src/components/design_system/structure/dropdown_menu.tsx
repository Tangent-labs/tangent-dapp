"use client"

import React, { ReactNode } from "react"
import Panel from "./panel"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { IconChevron } from "@/components/icons/icon_chevron"

type TgHoverCardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export default function DropdownMenu({ children }: TgHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button type="button">
          <IconChevron className="w-2" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="z-100 !m-0 w-fit border-none bg-black !p-0">
        <Panel>{children}</Panel>
      </HoverCardContent>
    </HoverCard>
  )
}
