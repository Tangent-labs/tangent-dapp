import { useMemo } from "react"
import { APRDisplay } from "./apr_display"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ValueType } from "recharts/types/component/DefaultTooltipContent"
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type PositionAPRProps = {
  apr: number
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
      <rect x={width - 35} y={y + 6} width={56} rx={15} height={30} fill="#0075FF" />
      <text x={width - 6} y={y + 25} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight={700}>
        Avg {averageApy.toFixed(0)}%
      </text>
    </g>
  )
}

const CustomsUSGPerformanceTooltip = (props: {
  active?: boolean | undefined
  payload?: Array<{ dataKey?: string | number | undefined; value?: ValueType | undefined }> | undefined
  label?: number
}) => {
  const date = new Date(props?.label as number)
  const value = Number(props?.payload ? props?.payload[0]?.value : 0)
  const dateLabel = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`

  return (
    <div className="pointer-events-none flex flex-col items-start justify-between gap-3 rounded-[10px] bg-dark px-3 py-2 text-[10px]">
      <div className="font-extralight text-white">{dateLabel}</div>
      <div className="flex items-center justify-center gap-1">
        <div className="h-3 w-3 rounded-[3px] bg-row-success"></div>
        <div className="text-xs font-semibold text-white">APR: {value.toFixed(1)}%</div>
      </div>
    </div>
  )
}

const formatYAxis = (tick: number) => `${tick}%`

const formatXAxis = (tick: string) => {
  const date = new Date(tick)
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
}

export const PositionAPR = ({ apr, fetchsUSGHistoryAPY, sUSGSelectedTab, apyHistory }: PositionAPRProps) => {
  const averageApy = useMemo(() => {
    if (!apyHistory || apyHistory.length === 0) return 0
    const sum = apyHistory.reduce((acc, point) => acc + point.uv, 0)
    return sum / apyHistory.length
  }, [apyHistory])

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <APRDisplay apr={apr} />

        <div className="hidden items-end justify-end gap-2 md:flex">
          <ButtonTab onClick={() => fetchsUSGHistoryAPY("1m")} label={"1m"} active={sUSGSelectedTab === "1m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchsUSGHistoryAPY("3m")} label={"3m"} active={sUSGSelectedTab === "3m"} className="rounded-full !py-1" />
          <ButtonTab onClick={() => fetchsUSGHistoryAPY("1y")} label={"1y"} active={sUSGSelectedTab === "1y"} className="rounded-full !py-1" />
        </div>
      </div>

      <div className="mb mt-3 flex h-72 min-h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={400}
            data={apyHistory}
            margin={{
              top: 10,
              right: 20,
              left: 20,
              bottom: 10,
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
              tickFormatter={formatXAxis}
              scale="point"
              padding={{ left: 10, right: 10 }}
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
            />

            <YAxis orientation="right" tickFormatter={formatYAxis} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />

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
              content={<CustomsUSGPerformanceTooltip />}
            />

            <ReferenceLine y={averageApy} stroke="#0075FF" strokeDasharray="8 6" strokeWidth={2} label={<CustomAverageDisplay averageApy={averageApy} />} />

            {apyHistory.at(-1) && <ReferenceDot x={apyHistory.at(-1)!.date} y={apyHistory.at(-1)!.uv} r={4} fill="#95FF00" stroke="#95FF00" isFront={true} />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
