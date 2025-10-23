import { formatDollar } from "@/lib/number_formatter"

export const COLORS = ["#A145FF", "#FA6298", "#FAA24B", "#F9D33D", "#88E143", "#00A6FF"]

export const mockBarChartData = [
  { date: "2025-01-06", uv: 4000 },
  { date: "2025-01-13", uv: 3000 },
  { date: "2025-01-20", uv: 2000 },
  { date: "2025-01-27", uv: 2780 },
  { date: "2025-02-03", uv: 1890 },
  { date: "2025-02-10", uv: 2390 },
  { date: "2025-02-17", uv: 3490 },
  { date: "2025-02-24", uv: 4000 },
  { date: "2025-03-03", uv: 3000 },
  { date: "2025-03-10", uv: 2000 },
  { date: "2025-03-17", uv: 2780 },
  { date: "2025-03-24", uv: 1890 },
  { date: "2025-03-31", uv: 2390 },
  { date: "2025-04-07", uv: 3490 },
]

export const formatYAxis = (tick: number) => `${formatDollar(tick / 1000000)}M$`

export const formatXAxis = (tick: string) => {
  const date = new Date(tick)
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

const RANGE_TO_MS: Record<string, number | null> = {
  "1w": 7 * ONE_DAY_MS,
  "1m": 30 * ONE_DAY_MS,
  "3m": 90 * ONE_DAY_MS,
  "1y": 365 * ONE_DAY_MS,
  all: null,
}

export const convertRange = (range: string): number | null => {
  return RANGE_TO_MS[range] ?? null
}
