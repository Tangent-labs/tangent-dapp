"use client"

import { cn } from "@/lib/utils"
import React, { ReactNode } from "react"
import { IconChevron } from "@/components/icons/icon_chevron"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type DropdownMenuProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  label: string
  pathname?: string
}

export default function DropdownMenu({ children, label, pathname }: DropdownMenuProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="flex items-center justify-center gap-1" type="button">
          <div className="transition-all duration-200 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p
              className={cn(
                "cursor-pointer text-sm font-semibold text-white transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-blue-400 hover:text-transparent aria-disabled:text-gray-700",
                pathname?.toLowerCase()?.includes(label.toLowerCase()) ? "bg-tab bg-clip-text font-bold text-transparent" : ""
              )}
            >
              {label}
            </p>
          </div>
          <IconChevron className="w-2" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="z-100 !m-0 w-fit !border-none bg-black !p-0">
        <div className="rounded-[10px] p-2">{children}</div>
      </HoverCardContent>
    </HoverCard>
  )
}
