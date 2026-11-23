"use client"

import { useId, useMemo } from "react"
import { formatUnits } from "viem"
import { formatMillions } from "@/lib/number_formatter"
import { useRootContext } from "@/components/products/root/root_context"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { TokenImage } from "@/components/design_system/structure/token_image"

/**
 * USG peg card for the sidebar. Reads only what the live app already loads:
 * RootContext.priceHistory.USG (price-history API, 1m on mount), sUSGCurrentAPY, and USGsUSGMetrics for supply and spot price.
 */
function usePeg() {
  const { priceHistory, priceSelectedTabs, sUSGCurrentAPY } = useRootContext()
  const { USGsUSGMetrics } = useUSGContext()
  const points = priceHistory?.USG ?? []
  const spot = USGsUSGMetrics?.USGPrice ? Number(formatUnits(USGsUSGMetrics.USGPrice, 18)) : undefined
  const last = points.at(-1)?.uv ?? spot
  const supply = USGsUSGMetrics?.USGSupply ? Number(formatUnits(USGsUSGMetrics.USGSupply, 18)) : undefined
  return { points, last, range: priceSelectedTabs?.USG ?? "1m", apy: sUSGCurrentAPY, supply }
}

export function PegCardV2() {
  const { points, last, range, apy, supply } = usePeg()
  const delta = last !== undefined ? (last - 1) * 100 : undefined
  const lo = points.length ? Math.min(...points.map((p) => p.uv)) : undefined
  const hi = points.length ? Math.max(...points.map((p) => p.uv)) : undefined

  if (last === undefined) return <div className="h-[184px] animate-pulse rounded-xl border border-hairline bg-surface" />

  return (
    <div className="rounded-xl border border-hairline bg-surface p-3.5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
        <TokenImage token="USG" size={16} /> USG
        <span className="ml-auto text-xs font-normal uppercase text-ink-3">{range}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[24px] font-light tabular-nums tracking-[-0.02em]">${last.toFixed(4)}</span>
        {delta !== undefined && (
          <span className="text-xs tabular-nums text-ink-2">
            {delta < 0 ? "−" : "+"}
            {Math.abs(delta).toFixed(2)}% vs peg
          </span>
        )}
      </div>
      {points.length > 1 && <PegSparkline points={points.map((p) => p.uv)} />}
      {lo !== undefined && hi !== undefined && (
        <div className="mt-1 text-[11px] tabular-nums text-ink-3">
          Range ${lo.toFixed(4)} to ${hi.toFixed(4)}
        </div>
      )}
      <div className="mt-3 space-y-1.5 border-t border-divider pt-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-ink-2">sUSG APY</span>
          <span className="font-medium tabular-nums">{apy ? `${apy.toFixed(2)}%` : "-"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-2">USG supply</span>
          <span className="font-medium tabular-nums">{supply !== undefined ? formatMillions(supply) : "-"}</span>
        </div>
      </div>
    </div>
  )
}

/** Collapsed sidebar: price only, details in the tooltip. */
export function PegMiniV2() {
  const { last } = usePeg()
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-xl border border-hairline bg-surface py-2.5"
      title={last !== undefined ? `USG $${last.toFixed(4)}, ${((last - 1) * 100).toFixed(2)}% vs peg` : "USG"}
    >
      <TokenImage token="USG" size={16} />
      <span className="text-[11px] font-medium tabular-nums">{last !== undefined ? last.toFixed(4) : "-"}</span>
    </div>
  )
}

/** Line with a dashed $1.00 reference. SVG gets literal colors. */
function PegSparkline({ points }: { points: number[] }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "")
  const W = 194
  const H = 40
  const { path, area, refY } = useMemo(() => {
    const lo = Math.min(...points, 1)
    const hi = Math.max(...points, 1)
    const span = hi - lo || 0.0001
    const y = (v: number) => 3 + (1 - (v - lo) / span) * (H - 6)
    const x = (i: number) => (i / (points.length - 1)) * W
    const d = points.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("")
    return { path: d, area: `${d}L${W},${H}L0,${H}Z`, refY: y(1) }
  }, [points])
  const lastY = path.split(",").at(-1)

  return (
    <div className="relative mt-3">
      <span className="absolute -top-3.5 right-0 text-[10px] text-ink-3">$1.00</span>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={`peg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0075FF" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#0075FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <line x1="0" x2={W} y1={refY} y2={refY} stroke="rgba(255,255,255,0.25)" strokeDasharray="2 3" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={area} fill={`url(#peg-${id})`} />
        <path d={path} fill="none" stroke="#0075FF" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {lastY && <circle cx={W} cy={Number(lastY)} r={2.5} fill="#0075FF" />}
      </svg>
    </div>
  )
}
