"use client"

import { useId, useMemo } from "react"

/** Small line chart with optional area, end dot and dashed reference value. SVG gets literal colors, never CSS variables. */
export function Sparkline({
  values,
  height = 40,
  reference,
  area = true,
  dot = true,
  color = "#0075FF",
  className,
}: {
  values: number[]
  height?: number
  reference?: number
  area?: boolean
  dot?: boolean
  color?: string
  className?: string
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "")
  const W = 200
  const H = height
  const geo = useMemo(() => {
    if (values.length < 2) return null
    const all = reference !== undefined ? [...values, reference] : values
    const lo = Math.min(...all)
    const hi = Math.max(...all)
    const span = hi - lo || 1e-9
    const y = (v: number) => 3 + (1 - (v - lo) / span) * (H - 6)
    const x = (i: number) => (i / (values.length - 1)) * W
    const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("")
    return { d, fill: `${d}L${W},${H}L0,${H}Z`, refY: reference !== undefined ? y(reference) : null, endY: y(values[values.length - 1]) }
  }, [values, reference, H])

  if (!geo) return <div className={className} style={{ height: H }} />

  return (
    // the end dot is an HTML dot, not an SVG circle: the SVG is stretched to the width, a circle on its edge would be cut and squashed
    <div className={`relative ${className ?? ""}`} style={{ height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" className="block overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {geo.refY !== null && (
          <line
            x1="0"
            x2={W}
            y1={geo.refY}
            y2={geo.refY}
            stroke="rgba(255,255,255,0.25)"
            strokeDasharray="2 3"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        )}
        {area && <path d={geo.fill} fill={`url(#spark-${id})`} />}
        <path d={geo.d} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
      {dot && (
        <span
          aria-hidden
          className="absolute right-0 h-[6px] w-[6px] -translate-y-1/2 translate-x-1/2 rounded-full"
          style={{ top: `${(geo.endY / H) * 100}%`, background: color }}
        />
      )}
    </div>
  )
}
