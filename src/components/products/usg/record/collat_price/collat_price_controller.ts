"use client"

import { Time } from "lightweight-charts"
import { OracleGraphDataPoint } from "../../client_api"

export type PendleCollatApiType = {
  currency: string
  results: string
  timeFrame: string
  timestamp_end: number
  timestamp_start: number
  total: number
}

const DAY_IN_SECONDS = 24 * 60 * 60

const TIME_DIFF_BY_WINDOW: Record<string, number> = {
  "15m": 3 * DAY_IN_SECONDS,
  "1h": 12 * DAY_IN_SECONDS,
  "6h": 60 * DAY_IN_SECONDS,
  "1d": 240 * DAY_IN_SECONDS,
  "7d": 720 * DAY_IN_SECONDS,
}

export const computeTimeDiff = (customStartTime: string) => {
  return TIME_DIFF_BY_WINDOW[customStartTime] ?? 120 * DAY_IN_SECONDS
}

export const mapPendleResponseToGraphData = (resp: PendleCollatApiType, address: string) => {
  if (!resp?.results) throw new Error("Invalid response format")

  const lines = resp.results.trim().split("\n")
  const headers = lines[0].split(",")

  const data = lines.slice(1).map((line: string) => {
    const values = line.split(",")
    const row = Object.fromEntries(
      headers.map((label: string, index: number) => {
        return [label, values[index]]
      })
    )

    return {
      time: Number(row.time),
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
    }
  })

  return { chain: "1", address, data }
}

export type OraclePricePoint = { time: Time; value: number }

export const mapOracleResponseToLineData = (resp: OracleGraphDataPoint[] | null, bucketSizeMinutes: number): OraclePricePoint[] | null => {
  if (!resp?.length) return null

  const bucketSizeSeconds = Math.max(1, bucketSizeMinutes) * 60

  return resp
    .filter((row) => row.price != null && !isNaN(Number(row.price)))
    .map((row) => ({
      // Oracle buckets are returned on their end timestamp, while candles are drawn from bucket start.
      // Shift the line back by one bucket so both series line up visually.
      time: Math.floor(row.ts / 1000 - bucketSizeSeconds) as Time,
      value: Number(row.price),
    }))
}

const ORACLE_BUCKET_SIZE_BY_WINDOW: Record<string, number> = {
  "15m": 15,
  "1h": 60,
  "6h": 360,
  "1d": 1440,
  "7d": 10080,
}

export const computeOracleBucketSizeMinutes = (customStartTime: string): number => {
  return ORACLE_BUCKET_SIZE_BY_WINDOW[customStartTime] ?? 1440
}

const RANGE_TO_UNIT: Record<string, string> = {
  "1h": "hour",
  "1d": "day",
  "1w": "week",
}

export const computePendleAggUnit = (customStartTime: string): string => {
  return RANGE_TO_UNIT[customStartTime]
}

const AGGREGATION_BY_WINDOW: Record<string, { aggNumber: number; aggUnit: string }> = {
  "15m": { aggNumber: 15, aggUnit: "minute" },
  "1h": { aggNumber: 1, aggUnit: "hour" },
  "6h": { aggNumber: 6, aggUnit: "hour" },
  "1d": { aggNumber: 1, aggUnit: "day" },
  "7d": { aggNumber: 7, aggUnit: "day" },
}

export const computeAggNumberAndAggUnit = (customStartTime: string): { aggNumber: number; aggUnit: string } => {
  return AGGREGATION_BY_WINDOW[customStartTime] ?? { aggNumber: 1, aggUnit: "day" }
}
