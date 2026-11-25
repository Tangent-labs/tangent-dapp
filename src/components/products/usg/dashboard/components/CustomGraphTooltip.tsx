import { formatMillions } from "@/lib/number_formatter"
import { TooltipProps } from "recharts"

export type TooltipCategory = {
  key: string
  label: string
  className: string
}

type CustomChartTooltipProps = TooltipProps<number, string> & {
  categories: TooltipCategory[]
  totalKeys?: string[]
}

export const CustomTooltip = ({ active, payload, categories, totalKeys }: CustomChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null

  const values: Record<string, number> = {}
  let total = 0

  categories.forEach(({ key }) => {
    const item = payload.find((p) => p.dataKey === key)
    const val = (item?.value as number) ?? 0
    values[key] = val
    if (!totalKeys || totalKeys.includes(key)) total += val
  })

  const ts = payload[0]?.payload?.date as number
  const date = new Date(ts)
  const dateLabel = date.toDateString()
  const timeLabel = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  return (
    <div className="flex min-w-40 flex-col items-start justify-center gap-1 rounded-[10px] border border-white border-opacity-10 bg-input p-3 backdrop-blur-[60px]">
      <div className="mb-3 text-xs font-medium text-slate-300">
        {dateLabel} · {timeLabel}
      </div>

      <div className="mb-2 flex w-full items-center justify-between text-xs">
        <span className="font-semibold text-white">Total</span>
        <span className="font-semibold text-white">${formatMillions(total)}</span>
      </div>

      {categories.map(({ key, label, className }) => {
        if (values[key] === undefined || values[key] === null) return null

        return (
          <div key={key} className="flex w-full items-center justify-between text-xs">
            <span className={className}>{label}</span>
            <span className="text-white">${formatMillions(values[key])}</span>
          </div>
        )
      })}
    </div>
  )
}
