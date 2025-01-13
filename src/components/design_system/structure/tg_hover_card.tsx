"use client"

import { IconCircleHelp } from "@/components/icons"
import React, { ReactNode } from "react"
import Panel from "./panel"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type TgHoverCardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string
  children: ReactNode
}

export default function TgHoverCard({ children, title }: TgHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button type="button">
          <IconCircleHelp />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="z-20 !m-0 w-80 border-none bg-black !p-0">
        <Panel>
          <div className="grid gap-4">
            <div className="space-y-2">
              <span className="font-medium leading-none">{title}</span>
              <div className="mt-4">{children}</div>
            </div>
            <div className="grid gap-2"></div>
          </div>
        </Panel>
      </HoverCardContent>
    </HoverCard>
  )
}
