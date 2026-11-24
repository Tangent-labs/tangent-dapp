"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Roll } from "./roll"

/**
 * V2 chart kit (Aave Pro Insights and the Mebius chart rules): presentation only.
 * The live graph components keep their data, ranges and recharts setup; under UI_V2 they swap in these pieces.
 */

/** Hover cursor: a quiet dashed hairline, not a bright 2px rule. */
export const V2_CURSOR = { stroke: "rgba(255,255,255,0.22)", strokeWidth: 1, strokeDasharray: "3 3" }

/** Active point: the series color ringed with the card surface, so it reads on any line. */
export const v2ActiveDot = (color: string) => ({ r: 4, fill: color, stroke: "#1a1a1a", strokeWidth: 2 })

/** Axis tick style: small, quiet, tabular. */
export const V2_TICK = { fontSize: 11, fill: "#8f8f8f" }

export type TooltipRow = { color?: string; label: string; value: string }

/** Hover card: date on top, one row per series (dot, label, value), optional total. */
export function ChartTooltipV2({ title, rows, total }: { title: string; rows: TooltipRow[]; total?: TooltipRow }) {
  return (
    <div className="min-w-[180px] rounded-[10px] border border-white/[0.08] bg-raised px-3 py-2.5 font-sans text-xs shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
      <div className="mb-2 text-[11px] tabular-nums text-ink-3">{title}</div>
      {total && (
        <div className="mb-1.5 flex items-center justify-between gap-4 border-b border-white/[0.06] pb-1.5">
          <span className="font-medium text-white">{total.label}</span>
          <span className="font-semibold tabular-nums text-white">{total.value}</span>
        </div>
      )}
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-ink-2">
              {r.color && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: r.color }} />}
              {r.label}
            </span>
            <span className="font-medium tabular-nums text-white">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Date line used by the tooltips: "Sun Jun 7, 2026 · 7:44 PM". */
export const tooltipDate = (ts: number | string | Date) => {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ""
  const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  return `${day} · ${time}`
}

/** Change over the visible range, from the first to the last point. */
export const rangeChange = (first?: number, last?: number) =>
  first && last !== undefined && first !== 0 ? ((last - first) / Math.abs(first)) * 100 : undefined

/** Card head (Aave Insights): a quiet label, the current value large, the change over the selected range beside it. */
export function ChartHeadV2({
  label,
  value,
  change,
  right,
  className,
}: {
  label: string
  value: string
  change?: number
  right?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex w-full flex-wrap items-start justify-between gap-x-4 gap-y-3", className)}>
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-ink-2">{label}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[28px] font-medium leading-9 tracking-[-0.02em]">
            <Roll value={value} />
          </span>
          {change !== undefined && Number.isFinite(change) && (
            <span className={cn("text-[13px] font-medium tabular-nums", change < 0 ? "text-negative" : "text-ink-2")}>
              {change >= 0 ? "+" : "−"}
              {Math.abs(change).toFixed(2)}%
            </span>
          )}
        </div>
      </div>
      {right}
    </div>
  )
}

/** Inline legend: dot, label, value, optional share. No boxes. */
export function ChartLegendV2({ items }: { items: { color: string; label: ReactNode; value: string; share?: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: it.color }} />
          <span className="text-ink-2">{it.label}</span>
          <span className="font-medium tabular-nums text-white">{it.value}</span>
          {it.share && <span className="tabular-nums text-ink-3">{it.share}</span>}
        </span>
      ))}
    </div>
  )
}

/** Dashed average across the bars (complete periods only), labelled on the left. For the HTML bar charts. */
export function AverageLine({ values, axisMax }: { values: number[]; axisMax: number }) {
  const list = values.filter((v) => Number.isFinite(v))
  if (!list.length || !axisMax) return null
  const avg = list.reduce((a, b) => a + b, 0) / list.length
  const label = avg >= 1e6 ? `${(avg / 1e6).toFixed(2)}M` : avg >= 1e3 ? `${(avg / 1e3).toFixed(1)}K` : avg.toFixed(0)
  return (
    <div className="pointer-events-none absolute inset-x-0 z-10" style={{ bottom: `${Math.min(100, (avg / axisMax) * 100)}%` }}>
      <div className="w-full border-t border-dashed border-white/35" />
      <span className="absolute -top-[18px] left-0 rounded bg-raised px-1.5 py-px text-[10px] tabular-nums text-ink-2">avg ${label}</span>
    </div>
  )
}
