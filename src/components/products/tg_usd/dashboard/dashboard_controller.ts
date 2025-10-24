import { formatCompact } from "@/lib/number_formatter"

export const COLORS = ["#A145FF", "#FA6298", "#FAA24B", "#F9D33D", "#88E143", "#00A6FF"]

export const formatYAxis = (tick: number) => `$${formatCompact(tick)}`

export const formatXAxis = (tick: string) => {
  const date = new Date(tick)
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`
}
