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

export const formatYAxis = (tick: number) => `${(tick / 1000).toFixed(0)}k$`

export const formatXAxis = (tick: string) => {
  const date = new Date(tick)
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`
}

export const mockTotalSupplyData = [
  { date: "2025-01-06", uv: 4384000 },
  { date: "2025-01-13", uv: 3304000 },
  { date: "2025-01-20", uv: 2384000 },
  { date: "2025-01-27", uv: 2384780 },
  { date: "2025-02-03", uv: 1384890 },
  { date: "2025-02-10", uv: 2384390 },
  { date: "2025-02-17", uv: 3384490 },
  { date: "2025-02-24", uv: 4084000 },
  { date: "2025-03-03", uv: 3380000 },
  { date: "2025-03-10", uv: 2384000 },
  { date: "2025-03-17", uv: 2384780 },
  { date: "2025-03-24", uv: 1384890 },
  { date: "2025-03-31", uv: 2984390 },
  { date: "2025-04-07", uv: 3084490 },
]
