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
