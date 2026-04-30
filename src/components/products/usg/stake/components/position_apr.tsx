import { useMemo } from "react"
import { APRDisplay } from "./apr_display"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ValueType } from "recharts/types/component/DefaultTooltipContent"
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const TIME_TICK_COUNT = 7
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const RANGE_TO_MS: Record<string, number> = {
  "1m": 30 * ONE_DAY_MS,
  "3m": 90 * ONE_DAY_MS,
  "1y": 365 * ONE_DAY_MS,
}

type PositionAPRProps = {
  apy: number
  fetchsUSGHistoryAPY: (range: string) => Promise<void>
  sUSGSelectedTab: string
  apyHistory: {
    date: number
    uv: number
  }[]
}

const CustomAverageDisplay = (props: { averageApy: number; viewBox?: { y: number; width: number } }) => {
  const { viewBox, averageApy } = props

  if (!viewBox || !averageApy) return null

  const { width, y } = viewBox

  return (
    <g>
      <rect x={width - 72} y={y + 6} width={72} rx={15} height={30} fill="#0075FF" />
      <text x={width - 34} y={y + 25} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight={700}>
        Avg {averageApy.toFixed(2)}%
      </text>
    </g>
  )
}

const CustomsUSGPerformanceTooltip = (props: {
  active?: boolean | undefined
  payload?: Array<{ dataKey?: string | number | undefined; value?: ValueType | undefined }> | undefined
  label?: number
  range: string
}) => {
  if (!props.active || !props.payload || props.payload.length === 0 || props.label == null) return null

  const date = new Date(props.label)
  const value = Number(props.payload[0]?.value)

  if (!Number.isFinite(date.getTime()) || !Number.isFinite(value)) return null

  const dateLabel =
    props.range === "1y"
      ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date)
      : new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(date)

  return (
    <div className="pointer-events-none flex flex-col items-start justify-between gap-3 rounded-[10px] bg-dark px-3 py-2 text-[10px]">
      <div className="font-extralight text-white">{dateLabel}</div>
      <div className="flex items-center justify-center gap-1">
        <div className="h-3 w-3 rounded-[3px] bg-row-success"></div>
        <div className="text-xs font-semibold text-white">APY: {value.toFixed(1)}%</div>
      </div>
    </div>
  )
}

const formatYAxis = (tick: number) => `${tick}%`

const formatXAxis = (tick: number | string, range: string) => {
  const date = new Date(tick)
  if (range === "1y") {
    return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)
  }

  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(date)
}

export const PositionAPR = ({ apy, fetchsUSGHistoryAPY, sUSGSelectedTab, apyHistory }: PositionAPRProps) => {
  const averageApy = useMemo(() => {
    if (!apyHistory || apyHistory.length === 0) return 0
    const sum = apyHistory.reduce((acc, point) => acc + point.uv, 0)
    return sum / apyHistory.length
  }, [apyHistory])

  const timeAxis = useMemo(() => {
    if (!apyHistory || apyHistory.length === 0) return null

    const dates = apyHistory.map((point) => point.date).filter(Number.isFinite)
    if (dates.length === 0) return null

    const endTs = Math.max(...dates)
    const startTs = RANGE_TO_MS[sUSGSelectedTab] ? endTs - RANGE_TO_MS[sUSGSelectedTab] : Math.min(...dates)
    const spanMs = endTs - startTs

    if (spanMs <= 0) {
      return {
        domain: [startTs, endTs] as [number, number],
        ticks: [startTs],
      }
    }

    return {
      domain: [startTs, endTs] as [number, number],
      ticks: Array.from({ length: TIME_TICK_COUNT }, (_, i) => startTs + (spanMs * i) / (TIME_TICK_COUNT - 1)),
    }
  }, [apyHistory, sUSGSelectedTab])

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <APRDisplay apy={apy} />

        <div className="hidden items-end justify-end gap-2 md:flex">
          <ButtonTab onClick={() => fetchsUSGHistoryAPY("1m")} label={"1m"} active={sUSGSelectedTab === "1m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchsUSGHistoryAPY("3m")} label={"3m"} active={sUSGSelectedTab === "3m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchsUSGHistoryAPY("1y")} label={"1y"} active={sUSGSelectedTab === "1y"} className="rounded-full !py-1" />
        </div>
      </div>

      <div className="mb mt-3 flex h-72 min-h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={apyHistory}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#95FF00" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#95FF00" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

            <XAxis
              dataKey="date"
              type="number"
              scale="time"
              domain={timeAxis?.domain ?? ["dataMin", "dataMax"]}
              ticks={timeAxis?.ticks}
              tickFormatter={(tick) => formatXAxis(tick, sUSGSelectedTab)}
              padding={{ left: 0, right: 0 }}
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
              allowDataOverflow
            />

            <YAxis
              orientation="right"
              width={28}
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              axisLine={false}
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

            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.65)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
              allowEscapeViewBox={{ x: false, y: false }}
              content={<CustomsUSGPerformanceTooltip range={sUSGSelectedTab} />}
            />

            <ReferenceLine y={averageApy} stroke="#0075FF" strokeDasharray="8 6" strokeWidth={2} label={<CustomAverageDisplay averageApy={averageApy} />} />

            {apyHistory.at(-1) && <ReferenceDot x={apyHistory.at(-1)!.date} y={apyHistory.at(-1)!.uv} r={4} fill="#95FF00" stroke="#95FF00" isFront={true} />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
