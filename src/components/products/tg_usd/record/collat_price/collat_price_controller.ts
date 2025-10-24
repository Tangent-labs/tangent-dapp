export type PendleCollatApiType = {
  currency: string
  results: string
  timeFrame: string
  timestamp_end: number
  timestamp_start: number
  total: number
}

export const computeTimeDiff = (customStartTime: string) => {
  switch (customStartTime) {
    case "15m":
      return 24 * 60 * 60
    case "1h":
      return 7 * 24 * 60 * 60
    case "6h":
      return 30 * 24 * 60 * 60
    case "1d":
      return 120 * 24 * 60 * 60
    case "7d":
      return 180 * 24 * 60 * 60
    default:
      return 30 * 24 * 60 * 60
  }
}

export const mapPendleResponseToGraphData = (resp: PendleCollatApiType, chain: string, address: string) => {
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

  return { chain, address, data }
}

const RANGE_TO_UNIT: Record<string, string> = {
  "1h": "hour",
  "1d": "day",
  "1w": "week",
}

export const computePendleAggUnit = (customStartTime: string): string => {
  return RANGE_TO_UNIT[customStartTime]
}

export const computeAggNumberAndAggUnit = (customStartTime: string): { aggNumber: number; aggUnit: string } => {
  switch (customStartTime) {
    case "15m":
      return { aggNumber: 15, aggUnit: "minute" }
    case "1h":
      return { aggNumber: 1, aggUnit: "hour" }
    case "6h":
      return { aggNumber: 6, aggUnit: "hour" }
    case "1d":
      return { aggNumber: 1, aggUnit: "day" }
    case "7d":
      return { aggNumber: 7, aggUnit: "day" }
    default:
      return { aggNumber: 1, aggUnit: "day" }
  }
}
