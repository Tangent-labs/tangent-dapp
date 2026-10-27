import { ReactNode, useEffect, useMemo, useState } from "react"
import { TVLData } from "../../usg_type"
import { formatMillions } from "@/lib/number_formatter"
import { convertRange } from "@/components/products/root/root_controller"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ValueType } from "recharts/types/component/DefaultTooltipContent"
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const TIME_TICK_COUNT = 7
const CHART_Y_AXIS_WIDTH = 52
const CHART_MARGIN = { top: 20, right: -50, left: 0, bottom: 0 }
const X_AXIS_PADDING = { left: 0, right: 35 }
const AXIS_LINE_STYLE = { stroke: "rgba(255,255,255,0.08)" }
const TICK_STYLE = { fontSize: 12, fill: "rgba(255,255,255,0.5)" }
const SUSG_COLOR = "#4EB3DF"

type RangeKey = "1m" | "3m" | "1y"
type TvlHistoryPoint = {
  date: number
  uv: number
}

type PositionTVLProps = {
  tvl: TVLData[]
  tvlSelectedTab: string
  fetchTVLData: (range: string) => void
}

const formatDayMonth = (ts: number) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(ts))
const formatMonth = (ts: number) => new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(ts))
const formatMonthYear = (ts: number) => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(ts))

const RANGE_CONFIG: Record<
  RangeKey,
  {
    formatTick: (ts: number) => string
    formatTooltip: (ts: number) => string
  }
> = {
  "1m": {
    formatTick: formatDayMonth,
    formatTooltip: formatDayMonth,
  },
  "3m": {
    formatTick: formatDayMonth,
    formatTooltip: formatDayMonth,
  },
  "1y": {
    formatTick: formatMonth,
    formatTooltip: formatMonthYear,
  },
}

const RANGE_KEYS = Object.keys(RANGE_CONFIG) as RangeKey[]

const TvlTooltip = (props: {
  active?: boolean
  payload?: Array<{ dataKey?: string | number; value?: ValueType }>
  label?: number
  fmtLabel: (v: number) => ReactNode
}) => {
  if (!props.active || !props.payload || props.payload.length === 0 || props.label == null) return null

  const value = Number(props.payload[0]?.value)

  if (!Number.isFinite(props.label) || !Number.isFinite(value)) return null

  return (
    <div className="pointer-events-none flex flex-col items-start justify-between gap-3 rounded-[10px] bg-dark px-3 py-2 text-[10px]">
      <div className="font-extralight text-white">{props.fmtLabel(props.label)}</div>
      <div className="flex items-center justify-center gap-1">
        <div className="h-3 w-3 rounded-[3px] bg-dash-susg"></div>
        <div className="text-xs font-semibold text-white">TVL: ${formatMillions(value)}</div>
      </div>
    </div>
  )
}

const formatYAxis = (tick: number) => `$${formatMillions(tick)}`

export const PositionTVL = ({ tvl, tvlSelectedTab, fetchTVLData }: PositionTVLProps) => {
  const [selectedRange, setSelectedRange] = useState<RangeKey>("1m")

  // The sUSG TVL history is filtered locally from the full history kept in the root context (shared with the Dashboard TVL graph)
  useEffect(() => {
    if (tvlSelectedTab !== "all") fetchTVLData("all")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data, ticks, fmtTick, fmtTooltipLabel, startTs, endTs, latestPoint } = useMemo(() => {
    const rangeConfig = RANGE_CONFIG[selectedRange]

    const fullHistory: TvlHistoryPoint[] = (tvl ?? [])
      .map((point) => ({ date: point.date, uv: point.susg }))
      .filter((point) => Number.isFinite(point.date) && Number.isFinite(point.uv))
      .sort((a, b) => a.date - b.date)

    const lastTs = fullHistory.at(-1)?.date ?? 0
    const rangeMs = convertRange(selectedRange) ?? 0
    const validHistory = fullHistory.filter((point) => point.date >= lastTs - rangeMs)

    if (validHistory.length === 0) {
      return {
        data: [],
        ticks: [],
        fmtTick: rangeConfig.formatTick,
        fmtTooltipLabel: rangeConfig.formatTooltip,
        startTs: 0,
        endTs: 0,
        latestPoint: undefined,
      }
    }

    const startTs = validHistory[0].date
    const endTs = lastTs
    const spanMs = endTs - startTs

    return {
      data: validHistory,
      ticks: spanMs <= 0 ? [startTs] : Array.from({ length: TIME_TICK_COUNT }, (_, i) => startTs + (spanMs * i) / (TIME_TICK_COUNT - 1)),
      fmtTick: rangeConfig.formatTick,
      fmtTooltipLabel: rangeConfig.formatTooltip,
      startTs,
      endTs,
      latestPoint: validHistory.at(-1),
    }
  }, [tvl, selectedRange])

  const hasTvlHistory = latestPoint != null

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          <div className="flex items-center justify-center gap-[5px] rounded-[10px] bg-overlay-panel p-[10px]">
            <TokenImage token="sUSG" size={20} />
            sUSG
          </div>

          <div className="text-xl font-semibold">${formatMillions(latestPoint?.uv ?? 0)}</div>
        </div>

        <div className="hidden items-end justify-end gap-2 md:flex">
          {RANGE_KEYS.map((range) => (
            <ButtonTab key={range} onClick={() => setSelectedRange(range)} label={range} active={selectedRange === range} className="rounded-full !py-1" />
          ))}
        </div>
      </div>

      {hasTvlHistory ? (
        <div className="relative mt-2.5 h-[18rem]">
          <ResponsiveContainer width="100%" height="100%" className="!max-h-none">
            <AreaChart data={data} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="susgTvlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SUSG_COLOR} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={SUSG_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />

              <XAxis
                padding={X_AXIS_PADDING}
                dataKey="date"
                type="number"
                scale="time"
                domain={[startTs, endTs]}
                ticks={ticks}
                tickFormatter={fmtTick}
                tick={TICK_STYLE}
                axisLine={AXIS_LINE_STYLE}
                tickLine={false}
                allowDataOverflow
                height={20}
              />

              <YAxis
                orientation="right"
                width={CHART_Y_AXIS_WIDTH}
                axisLine={false}
                tick={({ x, y, payload }) => (
                  <text x={x - 10} y={y - 7} dy={4} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize={11}>
                    {formatYAxis(payload.value)}
                  </text>
                )}
                tickLine={false}
              />

              <Area
                type="monotone"
                dataKey="uv"
                stroke={SUSG_COLOR}
                strokeWidth={2}
                fill="url(#susgTvlGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: SUSG_COLOR,
                  strokeWidth: 2,
                  fill: SUSG_COLOR,
                  filter: "drop-shadow(0 0 8px rgba(78, 179, 223, 0.7))",
                }}
              />

              <Tooltip cursor={{ ...AXIS_LINE_STYLE, strokeWidth: 1.5, strokeDasharray: "4 4" }} content={<TvlTooltip fmtLabel={fmtTooltipLabel} />} />

              <ReferenceDot x={latestPoint.date} y={latestPoint.uv} r={4} fill={SUSG_COLOR} stroke={SUSG_COLOR} isFront={true} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mb mt-3 flex h-[18rem] w-full items-center justify-center text-subtitle">No TVL data</div>
      )}
    </>
  )
}
