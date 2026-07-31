"use client"

import { formatMillions } from "@/lib/number_formatter"
import { RevenueRange } from "../usg_type"

export const formatYAxis = (tick: number) => `$${formatMillions(tick)}`

export const getXAxisTicks = (data: { date: number }[], tickCount: number = 6): number[] => {
  if (data.length === 0) return []
  if (data.length <= tickCount) return data.map((d) => d.date)
  const step = (data.length - 1) / (tickCount - 1)
  return Array.from({ length: tickCount }, (_, i) => data[Math.round(i * step)].date)
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

const STEP_MULTIPLIERS = [1, 2, 2.5, 5, 10]

export const computeYAxisTicks = (maxValue: number, intervalCount: number = 4): { ticks: number[]; axisMax: number } => {
  const safeMax = Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 0
  if (safeMax === 0) return { ticks: [0], axisMax: 1 }

  const rawStep = safeMax / Math.max(1, intervalCount)
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = (STEP_MULTIPLIERS.find((multiplier) => multiplier * magnitude >= rawStep) ?? 10) * magnitude

  const axisMax = step * Math.ceil(safeMax / step)

  // The step can be fractional (2.5, 0.25...) so each tick is rounded to kill the float drift
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1)
  const ticks = Array.from({ length: Math.round(axisMax / step) + 1 }, (_, index) => Number((index * step).toFixed(decimals)))

  return { ticks, axisMax }
}

const MONTHS_RECORD: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
}

/**
 * Map what the API returns with shorter version for X axis
 */
export const formatPeriodLabel = (period: string, range: RevenueRange): string => {
  if (!period) return ""

  if (range === "month") return period.split(" ")[0]

  // Transform "May 11 - May 17" into "05/11"
  const [start] = period.split(" - ")
  const [month, day] = start.split(" ")
  const monthNumber = MONTHS_RECORD[month]

  if (!monthNumber || !day) return start
  return `${monthNumber}/${day.padStart(2, "0")}`
}
