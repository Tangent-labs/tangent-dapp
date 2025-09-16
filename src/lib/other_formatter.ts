import { format } from "date-fns"

export const formatAddress = (address?: string, len: number = 5): string => {
  if (!address) return "-"
  return `${address?.substring(0, len + 1)}...${address?.substring(42 - len, 42)}`
}

export const bigIntSerialize = (_: unknown, value: unknown): unknown => (typeof value === "bigint" ? value.toString() : value)

export const formatDate = (date: Date, _format: string) => format(date, _format)
