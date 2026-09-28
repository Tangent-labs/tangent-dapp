"use client"

import { useEffect, useId, useRef, useState } from "react"
import { animate, useReducedMotion } from "framer-motion"
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { CALCULATOR_MAX_PRICE, CALCULATOR_MIN_PRICE } from "../dashboard_user_calculator"
import type { VAPRPoint } from "../dashboard_user_type"

type VAPRChartProps = {
  data: VAPRPoint[]
  usgPrice: number
}

const X_TICKS = Array.from({ length: 10 }, (_, i) => Number((CALCULATOR_MAX_PRICE - i * 0.00125).toFixed(5)))

const formatPercentTick = (value: number) => `${value.toFixed(1)}%`

const TICK_STYLE = { fill: "rgba(255,255,255,0.45)", fontSize: 10 }

// When the curve changes (mode, amounts...), the points slide from their old vAPR to the new one: the curve only moves
// vertically, the prices (X axis) never move. Recharts would redraw the line from the left instead.
const TWEEN_DURATION = 0.4

const useTweenedPoints = (target: VAPRPoint[]) => {
  const shouldReduceMotion = useReducedMotion()
  const [points, setPoints] = useState(target)
  // What is displayed right now, so a new change starts from there even if the previous one is not over
  const current = useRef(target)

  useEffect(() => {
    const from = current.current

    if (shouldReduceMotion || from.length !== target.length) {
      current.current = target
      setPoints(target)
      return
    }

    const controls = animate(0, 1, {
      duration: TWEEN_DURATION,
      ease: "easeOut",
      onUpdate: (progress) => {
        const next = target.map((point, index) => ({ price: point.price, vAPR: from[index].vAPR + (point.vAPR - from[index].vAPR) * progress }))
        current.current = next
        setPoints(next)
      },
    })

    return () => controls.stop()
  }, [target, shouldReduceMotion])

  return points
}

export const VAPRChart = ({ data, usgPrice }: VAPRChartProps) => {
  const gradientId = useId().replace(/:/g, "")
  const points = useTweenedPoints(data)

  return (
    <div className="relative flex h-full w-full flex-col">
      <span className="text-sm font-semibold text-white">vAPR</span>

      <div className="relative min-h-[240px] w-full flex-1 md:min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%" className="!absolute inset-0 !max-h-none">
          <LineChart data={points} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0075ff" />
                <stop offset="100%" stopColor="#00c2ff" />
              </linearGradient>
            </defs>

            <CartesianGrid horizontal vertical={false} stroke="#FFFFFF1A" />

            <XAxis
              dataKey="price"
              type="number"
              reversed
              domain={[CALCULATOR_MIN_PRICE, CALCULATOR_MAX_PRICE]}
              ticks={X_TICKS}
              tickFormatter={(value: number) => String(value)}
              tick={TICK_STYLE}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />

            <YAxis type="number" tickFormatter={formatPercentTick} tick={TICK_STYLE} tickLine={false} axisLine={false} width={48} />

            <ReferenceLine y={0} stroke="white" strokeWidth={1} ifOverflow="extendDomain" />

            <ReferenceLine
              x={usgPrice}
              stroke="white"
              strokeDasharray="2 2"
              strokeWidth={1}
              ifOverflow="hidden"
              label={{ value: `${usgPrice} (USG price)`, position: "insideTopLeft", fill: "white", fontSize: 10, dx: 6, dy: -14 }}
            />

            <Tooltip
              cursor={{ stroke: "white", strokeDasharray: "2 2", strokeWidth: 1 }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="flex min-w-24 flex-col gap-1 rounded-[10px] border border-white/10 bg-input p-2.5 text-[10px] text-white backdrop-blur-[60px]">
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="font-semibold">vAPR:</span>
                      <span>{Number(payload[0]?.value).toFixed(1)}%</span>
                    </div>
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="font-semibold">USG:</span>
                      <span>${Number(payload[0]?.payload?.price).toFixed(5)}</span>
                    </div>
                  </div>
                ) : null
              }
            />

            <Line
              type="monotone"
              dataKey="vAPR"
              name="vAPR (%)"
              stroke={`url(#${gradientId})`}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "#0075ff", stroke: "white", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <span className="self-end text-sm text-white">USG&rsquo;s Price</span>
    </div>
  )
}
