import { getGaugeArcs, EMPTY_GAUGE_ITEMS } from "../dashboard_user_controller"
import type { AllocationItem } from "../dashboard_user_type"

type AllocationGaugeProps = {
  items: AllocationItem[]
  // Nothing to show: one faint arc on the whole semicircle
  isEmpty?: boolean
  children?: React.ReactNode
}

const EMPTY_GAUGE_COLOR = "rgba(255,255,255,0.06)"

export const AllocationGauge = ({ items, isEmpty, children }: AllocationGaugeProps) => {
  const arcs = getGaugeArcs(isEmpty ? EMPTY_GAUGE_ITEMS : items)

  return (
    <div className="relative mx-auto aspect-[250/130] w-full max-w-[327px]">
      <svg viewBox="0 0 250 130" className="absolute inset-0 size-full" fill="none" aria-hidden>
        {arcs.map((arc) => (
          <path key={arc.key} d={arc.path} stroke={isEmpty ? EMPTY_GAUGE_COLOR : arc.color} strokeWidth="10" strokeLinecap="round" />
        ))}
      </svg>

      <div className="absolute inset-x-0 top-[60%] flex -translate-y-1/2 flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}
