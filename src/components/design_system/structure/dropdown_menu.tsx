"use client"

import React, { ReactNode } from "react"
import Panel from "./panel"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { IconChevron } from "@/components/icons/icon_chevron"

type TgHoverCardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  label: string
}

export default function DropdownMenu({ children, label }: TgHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="flex items-center justify-center gap-1" type="button">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p className="cursor-pointer text-sm aria-disabled:text-gray-700">{label}</p>
          </div>
          <IconChevron className="w-2" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="z-100 !m-0 w-fit border-none bg-black !p-0">
        <Panel>{children}</Panel>
      </HoverCardContent>
    </HoverCard>
  )
}
