"use client"

import { ReactNode, useId, useMemo } from "react"
import { Area, AreaChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"
import { COLOR } from "@/v2/theme/colors"
import { ChartTooltipV2 } from "./chart"

/**
 * V2 time series chart, after Aave Pro Insights:
 * - the plot runs edge to edge under the card header (the caller bleeds it out of the card padding);
 * - values sit inside on the left, on dashed hairlines, no axis lines;
 * - the dates show on hover only, first date bottom left and "Now" bottom right;
 * - a solid hairline cursor, ringed points, the tooltip pinned at the top (date, time when the data is intraday, one
 *   row per series, a total for stacked series);
 * - the line fades in from the left edge, the latest point carries a soft halo.
 * Every V2 time chart goes through this component, so they all behave the same.
 */
export type TimeSeries = { key: string; label: string; color: string; fill?: boolean }

type Props<T> = {
  data: T[]
  /** timestamp field, in ms */
  xKey: string
  series: TimeSeries[]
  /** y tick format */
  format: (v: number) => string
  /** tooltip value format, the tick format when omitted (ticks are often rounder than the values) */
  valueFormat?: (v: number) => string
  height?: number | string
  stacked?: boolean
  domain?: [number | "auto" | "dataMin" | "dataMax", number | "auto" | "dataMin" | "dataMax"]
  ticks?: number[]
  /** fill from this value instead of the bottom (peg charts fill between the line and $1) */
  baseValue?: number
  /** dashed reference line with a small tag at its right end (peg, average) */
  reference?: { y: number; label: string }
  /** override the hover range labels (forecasts end in the future, not "Now") */
  startLabel?: string
  endLabel?: string
  className?: string
  children?: ReactNode
}

const DAY = 24 * 3600 * 1000
/** a numeric field of a row (rows are plain objects with typed fields) */
const val = (row: object | undefined, key: string) => Number((row as Record<string, unknown> | undefined)?.[key] ?? 0)

/** 1, 2, 2.5 or 5 times a power of ten, the first step that splits the span in about three */
const niceStep = (span: number) => {
  const raw = span / 3
  const pow = 10 ** Math.floor(Math.log10(raw))
  return ([1, 2, 2.5, 5, 10].find((m) => m * pow >= raw) ?? 10) * pow
}

const fmtDay = (ts: number, withYear: boolean) =>
  new Date(ts).toLocaleDateString("en-US", withYear ? { month: "short", day: "numeric", year: "numeric" } : { day: "numeric", month: "short" })
const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

export function TimeChartV2<T extends object>({
  data,
  xKey,
  series,
  format,
  valueFormat = format,
  height = 224,
  stacked,
  domain,
  ticks,
  baseValue,
  reference,
  startLabel,
  endLabel,
  className,
  children,
}: Props<T>) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "")
  const meta = useMemo(() => {
    const xs = data.map((d) => val(d, xKey)).filter(Number.isFinite)
    const first = xs[0] ?? 0
    const last = xs[xs.length - 1] ?? 0
    const range = last - first
    // intraday data shows its time in the tooltip, daily data only the date
    const step = xs.length > 1 ? range / (xs.length - 1) : DAY
    const longRange = range > 300 * DAY || new Date(first).getFullYear() !== new Date(last).getFullYear()
    const isNow = Date.now() - last < 1.5 * DAY
    return {
      intraday: step < 20 * 3600 * 1000,
      start: startLabel ?? (range < 2 * DAY ? fmtTime(first) : fmtDay(first, longRange)),
      end: endLabel ?? (isNow ? "Now" : range < 2 * DAY ? fmtTime(last) : fmtDay(last, longRange)),
      lastRow: data[data.length - 1],
    }
  }, [data, xKey, startLabel, endLabel])

  // value scale: round steps from the data (or the caller's domain and ticks), drawn as dashed hairlines with the value
  // sitting on the left of each line
  const scale = useMemo(() => {
    const values: number[] = []
    for (const row of data) {
      if (stacked) values.push(series.reduce((a, s) => a + val(row, s.key), 0))
      else for (const s of series) values.push(val(row, s.key))
    }
    if (baseValue !== undefined) values.push(baseValue)
    if (reference) values.push(reference.y)
    const finite = values.filter(Number.isFinite)
    const min = typeof domain?.[0] === "number" ? domain[0] : Math.min(...finite)
    const max = typeof domain?.[1] === "number" ? domain[1] : Math.max(...finite)
    const span = max - min || Math.abs(max) * 0.1 || 1
    const step = niceStep(span)
    const lo = typeof domain?.[0] === "number" ? domain[0] : Math.floor(min / step) * step
    const hi = typeof domain?.[1] === "number" ? domain[1] : Math.ceil(max / step) * step
    const lines =
      ticks ?? Array.from({ length: Math.floor((hi - Math.ceil(lo / step) * step) / step + 1e-9) + 1 }, (_, i) => Math.ceil(lo / step) * step + i * step)
    // the bottom line is the chart floor: no label there, the hover dates use that space
    return { domain: [lo, hi] as [number, number], lines: lines.filter((t) => t > lo + step * 0.01) }
  }, [data, series, stacked, baseValue, reference, domain, ticks])

  if (!data.length) return null
  const lastX = meta.lastRow ? val(meta.lastRow, xKey) : undefined
  // the halo marks the top of the stack (or each line when not stacked)
  const haloSeries = stacked ? series.slice(-1) : series

  return (
    <div className={cn("group/chart relative w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`${id}-fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
            {series.map((s) => (
              // the line fades in from the left edge
              <linearGradient key={s.key} id={`${id}-stroke-${s.key}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.15} />
                <stop offset="8%" stopColor={s.color} stopOpacity={1} />
              </linearGradient>
            ))}
          </defs>

          <XAxis dataKey={xKey} type="number" scale="time" domain={["dataMin", "dataMax"]} hide />
          <YAxis hide domain={scale.domain} allowDataOverflow />
          {scale.lines.map((t) => (
            <ReferenceLine
              key={t}
              y={t}
              stroke={COLOR.grid}
              strokeDasharray="3 3"
              label={{
                content: ({ viewBox }) => (
                  <text
                    x={12}
                    y={((viewBox as { y?: number } | undefined)?.y ?? 0) - 6}
                    fill={COLOR.ink3}
                    fontSize={11}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {format(t)}
                  </text>
                ),
              }}
            />
          ))}

          <Tooltip
            cursor={{ stroke: COLOR.cursor, strokeWidth: 1 }}
            position={{ y: 0 }}
            allowEscapeViewBox={{ x: false, y: true }}
            isAnimationActive={false}
            wrapperStyle={{ outline: "none", zIndex: 20 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const ts = Number(label)
              const row = payload[0]?.payload as T | undefined
              const rows = series.map((s) => ({ color: s.color, label: s.label, value: valueFormat(val(row, s.key)) }))
              const total = stacked ? series.reduce((a, s) => a + val(row, s.key), 0) : undefined
              return (
                <ChartTooltipV2
                  title={fmtDay(ts, true)}
                  time={meta.intraday ? fmtTime(ts) : undefined}
                  rows={stacked ? [...rows].reverse() : rows}
                  total={total !== undefined && series.length > 1 ? { label: "Total", value: valueFormat(total) } : undefined}
                />
              )
            }}
          />

          {reference && (
            <ReferenceLine
              y={reference.y}
              stroke={COLOR.line}
              strokeDasharray="4 4"
              label={{ value: reference.label, position: "insideBottomRight", fill: COLOR.ink2, fontSize: 11, offset: 8 }}
            />
          )}

          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stackId={stacked ? "1" : undefined}
              stroke={`url(#${id}-stroke-${s.key})`}
              strokeWidth={1.5}
              fill={s.fill === false ? "transparent" : `url(#${id}-fill-${s.key})`}
              baseValue={baseValue}
              dot={false}
              activeDot={{ r: 4, fill: s.color, stroke: COLOR.ring, strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}

          {lastX !== undefined &&
            haloSeries.map((s) => {
              const y = stacked ? series.reduce((a, x) => a + val(meta.lastRow, x.key), 0) : val(meta.lastRow, s.key)
              if (!Number.isFinite(y)) return null
              return (
                <ReferenceDot
                  key={s.key}
                  x={lastX}
                  y={y}
                  r={4}
                  isFront
                  shape={({ cx, cy }: { cx?: number; cy?: number }) =>
                    cx === undefined || cy === undefined ? (
                      <g />
                    ) : (
                      <g>
                        <circle cx={cx} cy={cy} r={8} fill={s.color} opacity={0.18} />
                        <circle cx={cx} cy={cy} r={3.5} fill={s.color} />
                      </g>
                    )
                  }
                />
              )
            })}
          {children}
        </AreaChart>
      </ResponsiveContainer>

      {/* dates on hover only, like Aave */}
      <div className="pointer-events-none absolute inset-x-3 bottom-1.5 flex justify-between text-[11px] tabular-nums text-ink-3 opacity-0 transition-opacity duration-150 group-hover/chart:opacity-100">
        <span>{meta.start}</span>
        <span>{meta.end}</span>
      </div>
    </div>
  )
}
