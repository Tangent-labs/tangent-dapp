export const formatAddress = (address?: string, len: number = 5): string => {
  if (!address) return "-"
  return `${address?.substring(0, len)}...${address?.substring(42 - len - 1, 42)}`
}

export const bigIntSerialize = (_: unknown, value: unknown): unknown => (typeof value === "bigint" ? value.toString() : value)
