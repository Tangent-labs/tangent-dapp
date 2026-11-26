"use client"

import { Check, ChevronLeft, ChevronRight, Monitor, Moon, Sun } from "lucide-react"
import { APPEARANCES, Appearance } from "./constants"
import { useAppearance } from "./use-appearance"

const ICON: Record<Appearance, typeof Sun> = { system: Monitor, light: Sun, dark: Moon }
const ROW = "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.06]"

/** Menu entry (Aave Pro style): "Appearance" with the current choice, opens the panel below. */
export function AppearanceRow({ onOpen }: { onOpen: () => void }) {
  const { appearance } = useAppearance()
  const Icon = ICON[appearance]
  return (
    <button type="button" onClick={onOpen} className={ROW}>
      <Icon className="h-4 w-4 text-ink-2" strokeWidth={1.75} />
      Appearance
      <span className="ml-auto flex items-center gap-0.5 text-ink-3">
        {APPEARANCES.find((a) => a.value === appearance)?.label}
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    </button>
  )
}

/** The three choices, swapped in place of the menu. System follows the device. */
export function AppearancePanel({ onBack }: { onBack: () => void }) {
  const { appearance, setAppearance } = useAppearance()
  return (
    <div>
      <button type="button" onClick={onBack} className={`${ROW} text-ink-2`}>
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        Appearance
      </button>
      <div className="mx-1 my-1 h-px bg-divider" />
      {APPEARANCES.map(({ value, label }) => {
        const Icon = ICON[value]
        const active = appearance === value
        return (
          <button
            key={value}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            onClick={() => setAppearance(value)}
            className={`${ROW} ${active ? "bg-white/[0.06] text-white" : "text-ink-2"}`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
            {active && <Check className="ml-auto h-4 w-4 text-action" strokeWidth={2.25} />}
          </button>
        )
      })}
    </div>
  )
}
