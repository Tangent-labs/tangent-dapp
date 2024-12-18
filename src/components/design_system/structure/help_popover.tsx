"use client"

import { IconCircleHelp } from "@/components/icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import React, { ReactNode } from "react"
import Panel from "./panel"

type HelpPropoverProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string
  children: ReactNode
}

export default function HelpPropover({ children, title, ...props }: HelpPropoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" {...props} title={title}>
          <IconCircleHelp />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="z-20 !m-0 w-80 border-none !p-0">
        <Panel>
          <div className="grid gap-4">
            <div className="space-y-2">
              <span className="font-medium leading-none">{title}</span>
              <div className="mt-4">{children}</div>
            </div>
            <div className="grid gap-2"></div>
          </div>
        </Panel>
      </PopoverContent>
    </Popover>
  )
}
