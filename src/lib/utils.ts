import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// usage  {JSON.stringify(data, bigIntSerialize)}
export const bigIntSerialize = (_: unknown, value: unknown): unknown => (typeof value === "bigint" ? value.toString() : value)

export const formatAddress = (address?: string, len: number = 5): string => {
  if (!address) return "-"
  return `${address?.substring(0, len)}...${address?.substring(42 - len - 1, 42)}`
}
