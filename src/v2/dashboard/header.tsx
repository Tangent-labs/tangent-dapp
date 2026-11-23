"use client"

import { useRootContext } from "@/components/products/root/root_context"
import { formatMillions } from "@/lib/number_formatter"

/** V2 palette for data series: blue first, then quiet tints. No green, no yellow. */
export const V2_SERIES = { blue: "#0075FF", violet: "#a79bff", pink: "#e78fb3", gold: "#d9c49a", slate: "#8fa3bf" } as const

/**
 * V2 Dashboard header: one sentence and the four numbers that frame the charts below.
 * Everything comes from RootContext (the same values the charts and the top bar already read).
 */
export function DashboardHeaderV2() {
  const { protocolCurrentTVL, priceHistory, USGCurrentSupply, sUSGCurrentAPY } = useRootContext()
  const price = priceHistory?.USG?.at(-1)?.uv
  const tvl = protocolCurrentTVL?.total
  const pegGap = price !== undefined ? (price - 1) * 100 : undefined

  return (
    <div className="w-full">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Protocol</h1>
      <p className="mt-1 max-w-[720px] text-[14px] text-ink-2">
        How Tangent is doing: the USG peg, what is locked, what is borrowed and what the protocol earns. Pick a period on any chart.
      </p>
      <div className="mt-8 flex flex-wrap items-stretch gap-y-4">
        <div className="min-w-[220px] flex-[1.6] pr-8">
          <div className="text-xs text-ink-3">Total value locked</div>
          <div className="mt-1 text-[48px] font-light tabular-nums leading-[1.05] tracking-[-0.02em]">{tvl ? `$${formatMillions(tvl)}` : "-"}</div>
        </div>
        <Stat
          label="USG price"
          value={price !== undefined ? `$${price.toFixed(4)}` : "-"}
          sub={pegGap !== undefined ? `${pegGap >= 0 ? "+" : "−"}${Math.abs(pegGap).toFixed(2)}% vs peg` : undefined}
        />
        <Stat label="USG supply" value={USGCurrentSupply ? formatMillions(USGCurrentSupply) : "-"} sub="In circulation" />
        <Stat label="sUSG APY" value={sUSGCurrentAPY ? `${sUSGCurrentAPY.toFixed(2)}%` : "-"} sub="7 days trailing" />
      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-[150px] flex-1 border-l border-divider px-6">
      <div className="text-xs text-ink-3">{label}</div>
      <div className="mt-1 whitespace-nowrap text-[24px] font-medium tabular-nums tracking-[-0.02em]">{value}</div>
      {sub && <div className="mt-1.5 text-xs tabular-nums text-ink-2">{sub}</div>}
    </div>
  )
}
