"use client"

import { useMemo } from "react"
import { formatMillions } from "@/lib/number_formatter"
import { LiquidityRange, LpLiquidityHistory } from "../../usg_type"
import { Divider } from "@/components/design_system/structure/divider"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart, Tooltip, CartesianGrid } from "recharts"
import { formatXAxis, formatYAxis, getDataRangeMs, getXAxisTicks } from "../dashboard_controller"
import { CustomTooltip, TooltipCategory } from "./CustomGraphTooltip"

type GraphLpLiquidityProps = {
  liquidity: LpLiquidityHistory
  selectedTab: LiquidityRange
  fetchLiquidity: (range: LiquidityRange) => void
}

const RANGES: LiquidityRange[] = ["1w", "1m", "1y", "all"]

// Class names are spelled out so Tailwind picks them up
const PALETTE = [
  { stroke: "#0075FF", className: "text-[#0075FF]" },
  { stroke: "#24DD9A", className: "text-[#24DD9A]" },
  { stroke: "#4EB3DF", className: "text-[#4EB3DF]" },
  { stroke: "#A3FF12", className: "text-[#A3FF12]" },
  { stroke: "#B57BFF", className: "text-[#B57BFF]" },
  { stroke: "#FF9F43", className: "text-[#FF9F43]" },
]

export const GraphLpLiquidity = ({ liquidity, selectedTab, fetchLiquidity }: GraphLpLiquidityProps) => {
  // Pivot per-LP histories into one row per date; LPs created later count as 0 before their first point
  const data = useMemo(() => {
    const rows = new Map<number, { date: number; [lpName: string]: number }>()
    liquidity.lps.forEach((lp) =>
      lp.history.forEach(({ date, liquidityUsd }) => {
        const ts = new Date(date).getTime()
        if (!rows.has(ts)) rows.set(ts, { date: ts })
        rows.get(ts)![lp.lpName] = liquidityUsd
      })
    )
    return [...rows.values()]
      .sort((a, b) => a.date - b.date)
      .map((row) => ({ ...Object.fromEntries(liquidity.lps.map((lp) => [lp.lpName, 0])), ...row }) as typeof row)
  }, [liquidity])

  // Smallest LP at the bottom of the stack, same as the TVL graph
  const series = useMemo(
    () =>
      liquidity.lps
        .map((lp, i) => ({
          key: lp.lpName,
          avg: lp.history.reduce((sum, h) => sum + h.liquidityUsd, 0) / Math.max(1, data.length),
          ...PALETTE[i % PALETTE.length],
        }))
        .sort((a, b) => a.avg - b.avg),
    [liquidity, data.length]
  )

  const categories: TooltipCategory[] = [...series].reverse().map((s) => ({ key: s.key, label: s.key, className: s.className }))

  const rangeMs = getDataRangeMs(data)
  const xAxisTicks = getXAxisTicks(data)

  return (
    <ReliefCard className="flex w-full flex-col items-start justify-start p-5">
      <div className="flex w-full items-center justify-between">
        <div className="flex text-xl font-semibold">LP Liquidity</div>

        <div className="flex gap-2">
          {RANGES.map((range) => (
            <ButtonTab key={range} onClick={() => fetchLiquidity(range)} label={range} active={selectedTab === range} className="rounded-full !py-1" />
          ))}
        </div>
      </div>

      <Divider />
      <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center justify-start gap-1">
          <div className="text-subtitle">Total: </div>
          <div className="font-semibold text-white">${formatMillions(liquidity.total)}</div>
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {[...series].reverse().map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-subtitle">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.stroke }} />
              {s.key}
            </div>
          ))}
        </div>
      </div>

      {/* CHART */}
      <div className="relative min-h-56 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%" className="absolute inset-0">
          <AreaChart data={data} margin={{ top: 15, right: -50, left: -5, bottom: -10 }}>
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => formatXAxis(tick, rangeMs)}
              ticks={xAxisTicks}
              scale="point"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
              padding={{ left: 0, right: 40 }}
            />

            <YAxis
              orientation="right"
              axisLine={false}
              tick={({ x, y, payload }) => (
                <text x={x - 10} y={y - 7} dy={4} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize={11}>
                  {formatYAxis(payload.value)}
                </text>
              )}
              tickLine={false}
              width={48}
            />
            <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.06)" />

            <defs>
              {PALETTE.map((c, i) => (
                <linearGradient key={c.stroke} id={`lp-liquidity-gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c.stroke} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={c.stroke} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stackId="1"
                stroke={s.stroke}
                strokeWidth={1.5}
                fill={`url(#lp-liquidity-gradient-${PALETTE.findIndex((c) => c.stroke === s.stroke)})`}
                name={s.key}
              />
            ))}

            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.7)", strokeWidth: 2, strokeDasharray: "4 4" }}
              allowEscapeViewBox={{ x: false, y: false }}
              content={<CustomTooltip categories={categories} />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ReliefCard>
  )
}
