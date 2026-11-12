"use client"

import { cn } from "@/lib/utils"
import { POSITION_TABS } from "../dashboard_user_controller"
import type { PositionTabKey } from "../dashboard_user_type"

type PositionTabsProps = {
  value: PositionTabKey
  onChange: (tab: PositionTabKey) => void
}

export const PositionTabs = ({ value, onChange }: PositionTabsProps) => {
  const activeIndex = Math.max(
    POSITION_TABS.findIndex((tab) => tab.key === value),
    0
  )

  return (
    // Scrolls horizontally on small screens
    <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="relative min-w-[480px] md:min-w-0">
        <div role="tablist" aria-orientation="horizontal" className="flex w-full">
          {POSITION_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={tab.key === value}
              onClick={() => onChange(tab.key)}
              className={cn(
                "flex h-9 flex-1 select-none items-center justify-center whitespace-nowrap text-center text-base font-semibold transition-colors duration-200 xl:text-lg",
                tab.key === value ? "text-white" : "text-white/30 hover:text-white/60"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-overlay-panel" />

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-[3px] rounded-full bg-button-active transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${100 / POSITION_TABS.length}%`, transform: `translateX(${activeIndex * 100}%)` }}
        />
      </div>
    </div>
  )
}
