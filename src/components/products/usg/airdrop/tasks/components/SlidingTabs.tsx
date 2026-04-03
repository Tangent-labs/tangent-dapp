"use client"

import { cn } from "@/lib/utils"
import { useMemo } from "react"

type SlidingTabsProps = {
  labels: string[]
  value: string
  onSwitchTab: (s: string) => void
}

export function SlidingTabs({ labels, value, onSwitchTab }: SlidingTabsProps) {
  const activeTabIndex = useMemo(() => {
    const idx = labels.indexOf(value)
    return idx >= 0 ? idx : 0
  }, [labels, value])

  const numberOfLabels = labels.length

  return (
    <div className="relative mb-3 w-full">
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-slate-700/60 dark:bg-slate-600/40" />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 h-1 rounded-full",
          "bg-button-active",
          "transition-[transform,width] duration-300 ease-out motion-reduce:transition-none"
        )}
        style={{
          width: `${100 / numberOfLabels}%`,
          transform: `translateX(${activeTabIndex * 100}%)`,
        }}
      />

      <div role="tablist" aria-orientation="horizontal" className="relative flex w-full">
        {labels.map((label, i) => {
          const selected = i === activeTabIndex
          return (
            <button
              key={label}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${label}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "flex-1 select-none outline-none",
                "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                "dark:focus-visible:ring-offset-slate-900"
              )}
              onClick={() => onSwitchTab(label)}
            >
              <span
                className={cn(
                  "block px-4 py-3 text-center font-medium",
                  selected ? "text-slate-900 dark:text-slate-50" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
