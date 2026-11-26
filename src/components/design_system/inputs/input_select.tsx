"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReactNode } from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { UI_V2 } from "@/v2/ui"

interface InputSelectProps<T extends { value: string }> {
  options?: T[]
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  value?: string
  disabled?: boolean
  template?: (option: T) => ReactNode
}

export const InputSelect = <T extends { value: string }>({
  options,
  onChange,
  label,
  placeholder = "Select an option",
  className = "",
  value,
  template,
  disabled,
}: InputSelectProps<T>) => {
  if (UI_V2) {
    // V2: quiet chip trigger, dark menu. When the value has no matching option (options still loading), the raw value is shown instead of a blank.
    const selected = options?.find((o) => o.value === value)
    // nothing to choose from: a plain chip, no empty menu
    const empty = !options?.length
    return (
      <div className={cn("flex flex-col", className)}>
        {label && <div className="mb-1 text-xs text-ink-3">{label}</div>}
        <SelectPrimitive.Root disabled={disabled || empty} value={value} onValueChange={(v) => onChange(v)}>
          <SelectPrimitive.Trigger
            className={cn(
              "focus-visible:ring-action/50 flex h-9 w-full items-center justify-between gap-1.5 rounded-lg bg-white/[0.07] px-2 text-[13px] font-medium outline-none transition-colors hover:bg-white/[0.11] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:min-w-0 [&>span]:truncate",
              empty && "disabled:cursor-default disabled:opacity-100"
            )}
          >
            <SelectPrimitive.Value placeholder={<span className="text-ink-3">{placeholder}</span>}>
              {selected ? template ? <span className="flex items-center [&_img]:!h-5 [&_img]:!w-auto">{template(selected)}</span> : selected.value : value}
            </SelectPrimitive.Value>
            {!empty && <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={2} />}
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={6}
              className="z-50 max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-white/10 bg-raised p-1.5 font-sans text-white shadow-pop"
            >
              <SelectPrimitive.Viewport className="v2-scroll">
                {options?.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className="relative flex cursor-pointer select-none items-center gap-2 rounded-[6px] py-1.5 pl-2.5 pr-8 text-[13px] outline-none data-[highlighted]:bg-white/[0.07] data-[state=checked]:bg-white/[0.04]"
                  >
                    <SelectPrimitive.ItemText>{template ? template(option) : option.value}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="absolute right-2.5">
                      <Check className="h-3.5 w-3.5" strokeWidth={2} />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </div>
    )
  }

  return (
    <>
      <div className={`flex flex-col ${className}`}>
        <div className="flex w-full justify-between text-xs font-semibold text-subtitle">{label}</div>

        <Select disabled={disabled} value={value} onValueChange={(value) => onChange(value)}>
          <SelectTrigger disabled={disabled} className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          {/* Same width as the trigger : the base min-w-[8rem] overflowed narrow triggers */}
          <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-0">
            {options?.map((option) => (
              <SelectItem value={option.value} key={option.value} className="cursor-pointer">
                {template ? (
                  template(option)
                ) : (
                  <div className="flex items-center">
                    <span className="text-sm font-semibold">{option.value}</span>
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
