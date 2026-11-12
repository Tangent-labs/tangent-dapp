"use client"

import { IconCircleHelp } from "@/components/icons"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

// Same look as the inputs of the market page vAPR calculator
export const CALCULATOR_INPUT_CLASSNAME =
  "select-text flex h-10 flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-overlay-panel p-2.5 text-xs font-semibold text-white placeholder:text-subtitle/60 focus-visible:border-opacity-40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"

type CalculatorLabelProps = {
  label: string
  info: string
}

export const CalculatorLabel = ({ label, info }: CalculatorLabelProps) => (
  <div className="flex items-center gap-1 text-xs text-subtitle">
    {label}
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button type="button" className="flex items-center" aria-label={`About ${label}`}>
          <IconCircleHelp className="h-auto w-[11px] fill-subtitle" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="z-[9999] w-fit max-w-56 p-2 text-xs">
        {info}
      </HoverCardContent>
    </HoverCard>
  </div>
)

type CalculatorNumberFieldProps = CalculatorLabelProps & {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export const CalculatorNumberField = ({ label, info, value, onChange, disabled }: CalculatorNumberFieldProps) => (
  <div className="flex w-full flex-col items-start justify-center gap-2.5">
    <CalculatorLabel label={label} info={info} />
    <input
      placeholder="0"
      type="number"
      min={0}
      step={1}
      disabled={disabled}
      className={`${CALCULATOR_INPUT_CLASSNAME} w-full`}
      value={value ? Number(value.toFixed(2)) : ""}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
    />
  </div>
)
