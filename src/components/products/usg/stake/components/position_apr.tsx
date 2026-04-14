import { useMemo } from "react"
import { APRDisplay } from "./apr_display"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ValueType } from "recharts/types/component/DefaultTooltipContent"
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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

  const labelY = y - 8

  return (
    <g>
      <rect x={width + 30} y={labelY - 30} width={80} rx={15} className="rounded-[10px]" height={30} fill="rgba(10,10,20,0.95)" />
      <text x={width + 70} y={labelY - 10} textAnchor="middle" fill="#d9fb0b" fontSize={13} fontWeight={700}>
        Avg {averageApy.toFixed(2)}%
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

  return (
    <div className="pointer-events-none flex flex-col items-start justify-between gap-3 rounded-[10px] bg-dark px-3 py-2 text-[10px]">
      <div className="flex gap-1">
        <div className="font-extralight text-white">{date.toDateString()}</div>
      </div>
      <div className="flex items-center justify-center gap-1">
        <div className="h-3 w-3 rounded-[3px] bg-button-active"></div>
        <div className="text-xs font-semibold text-white"> APR: {value.toFixed(2)}%</div>
      </div>
    </div>
  )
}

const formatYAxis = (tick: number) => `${tick} %`

const formatXAxis = (tick: string) => {
  const date = new Date(tick)
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`
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
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0075FF" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#00c2ff" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0.08%" stopColor="#0075FF" />
                <stop offset="100%" stopColor="#00c2ff" />
              </linearGradient>
            </defs>

            <XAxis dataKey="date" tickFormatter={formatXAxis} scale="point" padding={{ left: 10, right: 10 }} />

            <YAxis orientation="left" tickFormatter={formatYAxis} />

            <Area
              type="monotone"
              dataKey="uv"
              stroke="url(#lineStroke)"
              strokeWidth={2}
              fill="url(#blueGradient)"
              dot={false}
              activeDot={{
                r: 3,
                stroke: "#0075FF",
                strokeWidth: 3,
                fill: "#0075FF",
                filter: "drop-shadow(0 0 12px rgba(251, 249, 17, 0.6))",
              }}
            />

            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 2 }}
              allowEscapeViewBox={{ x: false, y: false }}
              content={<CustomsUSGPerformanceTooltip />}
            />

            <ReferenceLine y={averageApy} stroke="#d9fb0b" strokeDasharray="8 6" strokeWidth={2} label={<CustomAverageDisplay averageApy={averageApy} />} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
