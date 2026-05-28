import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react"
import { APRDisplay } from "./apr_display"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ValueType } from "recharts/types/component/DefaultTooltipContent"
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const CLEAN_DATA_STARTING_TIMESTAMP = 1779752700000
const TIME_TICK_COUNT = 7
const CHART_Y_AXIS_WIDTH = 52
const AVERAGE_LABEL_PADDING_X = 14
const AVERAGE_LABEL_HEIGHT = 30
const AVERAGE_LABEL_RIGHT_OFFSET = 0
const AVERAGE_LABEL_ESTIMATED_CHAR_WIDTH = 7.5
const CHART_MARGIN = { top: 20, right: -50, left: 0, bottom: 0 }
const X_AXIS_PADDING = { left: 0, right: 35 }
const AXIS_LINE_STYLE = { stroke: "rgba(255,255,255,0.08)" }
const TICK_STYLE = { fontSize: 12, fill: "rgba(255,255,255,0.5)" }

type RangeKey = "1m" | "3m" | "1y"
type ApyHistoryPoint = {
  date: number
  uv: number
}

type PositionAPRProps = {
  apy: number
  fetchsUSGHistoryAPY: (range: string) => Promise<void>
  sUSGSelectedTab: string
  apyHistory: ApyHistoryPoint[]
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

const isRangeKey = (range: string): range is RangeKey => RANGE_KEYS.includes(range as RangeKey)

const CustomAverageDisplay = (props: { averageApy: number; apy: number; viewBox?: { y: number; width: number } }) => {
  const { viewBox, averageApy, apy } = props
  const textRef = useRef<SVGTextElement>(null)
  const text = Number.isFinite(averageApy) ? `Avg ${averageApy.toFixed(2)}%` : ""
  const [measuredTextWidth, setMeasuredTextWidth] = useState(() => text.length * AVERAGE_LABEL_ESTIMATED_CHAR_WIDTH)

  useLayoutEffect(() => {
    if (textRef.current) {
      setMeasuredTextWidth(textRef.current.getBBox().width)
    }
  }, [text])

  if (!viewBox || !text) return null

  const { width, y } = viewBox
  const labelWidth = Math.ceil(measuredTextWidth) + AVERAGE_LABEL_PADDING_X * 2

  const rectX = width - labelWidth - AVERAGE_LABEL_RIGHT_OFFSET

  const isAboveLine = apy < averageApy
  const rectY = isAboveLine ? y - AVERAGE_LABEL_HEIGHT - 6 : y + 6
  const textY = rectY + 19

  return (
    <g>
      <rect x={rectX} y={rectY} width={labelWidth} rx={15} height={AVERAGE_LABEL_HEIGHT} fill="#0075FF" />
      <text ref={textRef} x={rectX + labelWidth / 2} y={textY} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight={700}>
        {text}
      </text>
    </g>
  )
}

const ApyTooltip = (props: {
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
        <div className="h-3 w-3 rounded-[3px] bg-row-success"></div>
        <div className="text-xs font-semibold text-white">APY: {value.toFixed(1)}%</div>
      </div>
    </div>
  )
}

const formatYAxis = (tick: number) => `${tick}%`

export const PositionAPR = ({ apy, fetchsUSGHistoryAPY, sUSGSelectedTab, apyHistory }: PositionAPRProps) => {
  const selectedRange: RangeKey = isRangeKey(sUSGSelectedTab) ? sUSGSelectedTab : "1m"

  const { data, averageApy, ticks, fmtTick, fmtTooltipLabel, startTs, endTs, latestPoint } = useMemo(() => {
    const rangeConfig = RANGE_CONFIG[selectedRange]

    const validHistory = apyHistory
      .filter((p) => p?.date > CLEAN_DATA_STARTING_TIMESTAMP)
      .filter((point) => Number.isFinite(point.date) && Number.isFinite(point.uv))

    if (validHistory.length === 0) {
      return {
        data: [],
        averageApy: 0,
        ticks: [],
        fmtTick: rangeConfig.formatTick,
        fmtTooltipLabel: rangeConfig.formatTooltip,
        startTs: 0,
        endTs: 0,
        latestPoint: undefined,
      }
    }

    const dates = validHistory.map((point) => point.date)
    const startTs = Math.min(...dates)
    const endTs = Math.max(...dates)
    const spanMs = endTs - startTs
    const averageApy = validHistory.filter((p) => p?.date > CLEAN_DATA_STARTING_TIMESTAMP).reduce((acc, point) => acc + point.uv, 0) / validHistory.length

    return {
      data: validHistory,
      averageApy,
      ticks: spanMs <= 0 ? [startTs] : Array.from({ length: TIME_TICK_COUNT }, (_, i) => startTs + (spanMs * i) / (TIME_TICK_COUNT - 1)),
      fmtTick: rangeConfig.formatTick,
      fmtTooltipLabel: rangeConfig.formatTooltip,
      startTs,
      endTs,
      latestPoint: validHistory.at(-1),
    }
  }, [apyHistory, selectedRange])

  const hasApyHistory = latestPoint != null

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <APRDisplay apy={apy} />

        <div className="hidden items-end justify-end gap-2 md:flex">
          {RANGE_KEYS.map((range) => (
            <ButtonTab key={range} onClick={() => fetchsUSGHistoryAPY(range)} label={range} active={selectedRange === range} className="rounded-full !py-1" />
          ))}
        </div>
      </div>

      {hasApyHistory ? (
        <div className="relative mt-2.5 h-[18rem]">
          <ResponsiveContainer width="100%" height="100%" className="!max-h-none">
            <AreaChart data={data} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#95FF00" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#95FF00" stopOpacity={0} />
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
                stroke="#95FF00"
                strokeWidth={2}
                fill="url(#greenGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: "#95FF00",
                  strokeWidth: 2,
                  fill: "#95FF00",
                  filter: "drop-shadow(0 0 8px rgba(217, 251, 11, 0.7))",
                }}
              />

              <Tooltip cursor={{ ...AXIS_LINE_STYLE, strokeWidth: 1.5, strokeDasharray: "4 4" }} content={<ApyTooltip fmtLabel={fmtTooltipLabel} />} />

              <ReferenceLine
                segment={[
                  { x: startTs, y: averageApy },
                  { x: endTs, y: averageApy },
                ]}
                stroke="#0075FF"
                strokeDasharray="8 6"
                strokeWidth={2}
                label={<CustomAverageDisplay averageApy={averageApy} apy={apy} />}
              />

              <ReferenceDot x={latestPoint.date} y={latestPoint.uv} r={4} fill="#95FF00" stroke="#95FF00" isFront={true} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mb mt-3 flex h-[18rem] w-full items-center justify-center text-subtitle">No APY data</div>
      )}
    </>
  )
}
