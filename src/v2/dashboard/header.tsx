"use client"

import { useRootContext } from "@/components/products/root/root_context"
import { SERIES } from "@/v2/theme/colors"
import { formatMillions } from "@/lib/number_formatter"
import { TokenImage } from "@/components/design_system/structure/token_image"

/** V2 palette for data series: blue first, then quiet tints. No green, no yellow. */
export const V2_SERIES = SERIES

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
    <div className="w-full pt-2">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Analytics</h1>
      <p className="mt-1 max-w-[720px] text-[14px] text-ink-2">Overview of protocol activity and performance.</p>
      <div className="v2-kpis mt-8 flex flex-wrap items-stretch gap-y-4">
        <div className="min-w-[220px] flex-[1.6] pr-8">
          <div className="text-xs text-ink-3">Total value locked</div>
          <div className="mt-1 text-[48px] font-light tabular-nums leading-[1.05] tracking-[-0.02em]">{tvl ? `$${formatMillions(tvl)}` : "-"}</div>
        </div>
        <Stat
          token="USG"
          label="USG price"
          value={price !== undefined ? `$${price.toFixed(4)}` : "-"}
          sub={pegGap !== undefined ? `${pegGap >= 0 ? "+" : "−"}${Math.abs(pegGap).toFixed(2)}% vs peg` : undefined}
        />
        <Stat token="USG" label="USG supply" value={USGCurrentSupply ? formatMillions(USGCurrentSupply) : "-"} sub="In circulation" />
        <Stat token="sUSG" label="sUSG APY" value={sUSGCurrentAPY ? `${sUSGCurrentAPY.toFixed(2)}%` : "-"} sub="7 days trailing" />
      </div>
    </div>
  )
}

function Stat({ label, value, sub, token }: { label: string; value: string; sub?: string; token?: string }) {
  return (
    <div className="min-w-[150px] flex-1 border-l border-divider px-6">
      <div className="flex items-center gap-1.5 text-xs text-ink-3">
        {token && <TokenImage token={token} size={16} className="h-4 w-4" />}
        {label}
      </div>
      <div className="mt-1 whitespace-nowrap text-[24px] font-medium tabular-nums tracking-[-0.02em]">{value}</div>
      {sub && <div className="mt-1.5 text-xs tabular-nums text-ink-2">{sub}</div>}
    </div>
  )
}
