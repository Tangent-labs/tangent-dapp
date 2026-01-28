import { formatCompact } from "@/lib/number_formatter"

export const formatYAxis = (tick: number) => `$${formatCompact(tick)}`

export const formatXAxis = (tick: string) => {
  const date = new Date(tick)
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`
}
