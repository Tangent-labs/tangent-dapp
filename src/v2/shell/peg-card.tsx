"use client"

import { Roll } from "@/v2/ui/roll"
import { useId, useMemo } from "react"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "framer-motion"
import { VoidTexture } from "@/v2/ui/void-texture"
import { useRootContext } from "@/components/products/root/root_context"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { TokenImage } from "@/components/design_system/structure/token_image"

/**
 * USG peg card for the sidebar. Reads only what the live app already loads:
 * RootContext.priceHistory.USG (price-history API, 1m on mount), sUSGCurrentAPY, and USGsUSGMetrics for the spot price.
 */
function usePeg() {
  const { priceHistory, sUSGCurrentAPY } = useRootContext()
  const { USGsUSGMetrics } = useUSGContext()
  const points = priceHistory?.USG ?? []
  const spot = USGsUSGMetrics?.USGPrice ? Number(formatUnits(USGsUSGMetrics.USGPrice, 18)) : undefined
  const last = points.at(-1)?.uv ?? spot
  return { points, last, apy: sUSGCurrentAPY }
}

/** Sidebar peg card, kept to what matters at a glance: price, distance to the peg, the month line against $1, and the sUSG APY. */
export function PegCardV2() {
  const { points, last, apy } = usePeg()
  const reduce = useReducedMotion()
  const delta = last !== undefined ? (last - 1) * 100 : undefined

  if (last === undefined) return <div className="h-[148px] animate-pulse rounded-xl border border-hairline bg-surface" />

  return (
    <div className="relative isolate overflow-hidden rounded-xl border border-hairline bg-surface p-3.5">
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <VoidTexture id="peg-card" origin="tl" breathe={!reduce} cols={12} rows={6} />
      </span>
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
        <TokenImage token="USG" size={16} /> USG
        {delta !== undefined && (
          <span className={cn("ml-auto text-xs tabular-nums", Math.abs(delta) >= 1 ? "text-warning" : "text-ink-3")}>
            {delta < 0 ? "−" : "+"}
            {Math.abs(delta).toFixed(2)}% vs peg
          </span>
        )}
      </div>
      <div className="mt-1.5 text-[24px] font-light tabular-nums tracking-[-0.02em]">
        <Roll value={"$" + last.toFixed(4)} />
      </div>
      {points.length > 1 && <PegSparkline points={points.map((p) => p.uv)} />}
      <div className="mt-3 flex items-center justify-between border-t border-divider pt-2.5 text-xs">
        <span className="text-ink-2">sUSG APY</span>
        <span className="font-medium tabular-nums">{apy ? `${apy.toFixed(2)}%` : "-"}</span>
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
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" className="block overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`peg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0075FF" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#0075FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <line x1="0" x2={W} y1={refY} y2={refY} stroke="rgba(255,255,255,0.25)" strokeDasharray="2 3" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={area} fill={`url(#peg-${id})`} />
        <path d={path} fill="none" stroke="#0075FF" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
      {lastY && (
        <span
          aria-hidden
          className="absolute right-0 h-[6px] w-[6px] -translate-y-1/2 translate-x-1/2 rounded-full bg-action"
          style={{ top: `${(Number(lastY) / H) * 100}%` }}
        />
      )}
    </div>
  )
}
