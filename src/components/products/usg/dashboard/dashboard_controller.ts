import { formatMillions } from "@/lib/number_formatter"

export const formatYAxis = (tick: number) => `$${formatMillions(tick)}`

// export const formatXAxis = (tick: string) => {
//   const date = new Date(tick)
//   return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`
// }

/**
 * Compute a sensible tick interval based on data length
 * Aims for ~6-8 visible ticks max
 */
export const getTickInterval = (dataLength: number): number => {
  if (dataLength <= 8) return 0 // show all
  return Math.floor(dataLength / 6) - 1
}

/**
 * Format X axis — adapts to the visible range
 * rangeMs = last date - first date in your data
 */
export const formatXAxis = (tick: number, rangeMs?: number) => {
  const date = new Date(tick)

  // < 2 days → show time "Mar 4 14:00"
  if (rangeMs && rangeMs < 2 * 24 * 3600 * 1000) {
    return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  // < 6 months → "Mar 4"
  if (rangeMs && rangeMs < 180 * 24 * 3600 * 1000) {
    return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`
  }

  // > 6 months → "Mar '25"
  return `${date.toLocaleString("en-US", { month: "short" })} '${String(date.getFullYear()).slice(2)}`
}
export const getDataRangeMs = (data: { date: number }[]): number => {
  if (!data || data.length < 2) return 0
  return data[data.length - 1].date - data[0].date
}
