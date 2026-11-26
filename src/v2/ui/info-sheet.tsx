"use client"

import { ReactNode, useState } from "react"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ActionSheet, useIsMobile } from "./mobile-action-bar"

/**
 * Hover detail on desktop, tap-to-open bottom sheet on phones (hover does not exist on touch).
 * `trigger` is what sits inline; `content` is the detail; `title` heads the sheet.
 */
export function HoverInfo({
  trigger,
  content,
  title,
  align = "start",
  contentClassName,
  triggerClassName,
}: {
  trigger: ReactNode
  content: ReactNode
  title?: ReactNode
  align?: "start" | "center" | "end"
  contentClassName?: string
  triggerClassName?: string
}) {
  const mobile = useIsMobile()
  const [open, setOpen] = useState(false)

  if (mobile)
    return (
      <>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            // the trigger often sits inside a row link or a row toggle: open the sheet only
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setOpen(true)
            }
          }}
          // a 44px tall hit area around small inline labels, without moving the layout
          className={cn("relative cursor-pointer after:absolute after:-inset-x-1 after:-inset-y-3 after:content-['']", triggerClassName)}
        >
          {trigger}
        </span>
        <ActionSheet open={open} onClose={() => setOpen(false)} title={title}>
          <div className="text-[14px] leading-relaxed text-ink-2">{content}</div>
        </ActionSheet>
      </>
    )

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <span className={triggerClassName}>{trigger}</span>
      </HoverCardTrigger>
      <HoverCardContent side="top" align={align} className={cn("z-[9999] rounded-[10px] border-white/10 bg-raised p-3 text-xs text-white", contentClassName)}>
        {content}
      </HoverCardContent>
    </HoverCard>
  )
}
