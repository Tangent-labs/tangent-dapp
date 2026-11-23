"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type SelectMenuOption = { value: string; label: string; hint?: string; count?: number }

/** Single-select menu (V2 replaces native selects). The live list contexts are single-select, so this stays single-select. */
export function SelectMenu({
  label,
  value,
  options,
  onChange,
  allValue,
  className,
}: {
  label: string
  value: string
  options: SelectMenuOption[]
  onChange: (v: string) => void
  /** the option that means "no filter": the trigger then reads as a quiet label instead of a value */
  allValue?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)
  const filtered = allValue !== undefined && value !== allValue

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-medium ring-1 ring-inset transition-colors",
            filtered ? "bg-white/[0.08] text-white ring-white/15" : "bg-white/[0.03] text-ink-2 ring-hairline hover:text-white",
            className
          )}
        >
          <span className={filtered ? "text-ink-3" : undefined}>{label}</span>
          {(allValue === undefined || filtered) && <span className="text-white">{current?.label}</span>}
          <ChevronDown className={cn("h-3.5 w-3.5 text-ink-3 transition-transform duration-200", open && "rotate-180")} strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[240px] rounded-xl border border-white/10 bg-raised p-1.5 font-sans text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
      >
        <div role="listbox" aria-label={label}>
          {options.map((o) => {
            const active = o.value === value
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-[6px] px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06]",
                  active && "bg-white/[0.04]"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-[13px] font-medium">
                    {o.label}
                    {o.count !== undefined && <span className="text-xs tabular-nums text-ink-3">{o.count}</span>}
                  </span>
                  {o.hint && <span className="mt-0.5 block text-xs leading-snug text-ink-3">{o.hint}</span>}
                </span>
                <Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", active ? "text-white" : "text-transparent")} strokeWidth={2} />
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
