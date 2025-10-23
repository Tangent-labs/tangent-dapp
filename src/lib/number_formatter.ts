import { formatUnits } from "viem"

/**
 * Formats a number or string into a dollar amount with specified decimal places.
 *
 * @param value - The numeric value to format. Can be a number or a string representation of a number.
 *                If no value is provided, it defaults to 0.
 * @param decimals - The number of decimal places to include in the formatted output.
 *                   Defaults to 2, which is standard for dollar values.
 * @returns A string representing the value formatted as a dollar amount (e.g., "$1,234.56").
 */
export function formatDollar(value?: number | string, decimals: number = 2) {
  // Convert the input value to a number, or default to 0 if the conversion fails or the value is undefined.
  const formattedDollarValue = (Number(value) || 0).toFixed(decimals)

  // Format the number with the "en-US" locale to add thousands separators and return the result with a dollar sign.
  return `$${new Intl.NumberFormat("en-US").format(Number(formattedDollarValue))}`
}

export function formatPercent(value?: number | string, decimals: number = 2) {
  // Convert the input value to a number, or default to 0 if the conversion fails or the value is undefined.
  const formattedValue = (Number(value) || 0).toFixed(decimals)

  // Format the number with the "en-US" locale to add thousands separators and return the result with a dollar sign.
  return `${formattedValue}%`
}

/**
 * Converts a number into a BigInt with a specified number of decimals.
 * @param num - The number to convert.
 * @param decimals - The number of decimals.
 * @returns A BigInt representation of the number.
 */
export function toBigInt(num: number, decimals: number): bigint {
  // Multiply the number by 10^decimals to adjust for the decimal places
  const factor = 10 ** decimals
  // Return the result as a BigInt
  return BigInt(Math.round(num * factor))
}

/**
 * Formats a big integer value (as a string) into a human-readable decimal format.
 *
 * @param value - The big integer value as a string (e.g., "1000000000000000000").
 * @param decimals - The number of decimals the value is scaled by (e.g., 18 for ETH).
 * @param displayDecimals - The number of decimal places to show in the formatted output.
 * @returns A string representing the formatted value with thousands separators and limited decimal places.
 */
export function formatBigInt(value: bigint | string | undefined, decimals: number, displayDecimals: number): string {
  if (value === undefined || value === null) return ""
  const bigIntValue: bigint = typeof value === "string" ? BigInt(value) : value
  const reduceNumber = parseFloat(formatUnits(bigIntValue, decimals))
  if (!isNaN(reduceNumber)) {
    return formatNumber(reduceNumber, displayDecimals)
  }
  return ""
}
export function formatDollarBigInt(value: bigint | string | undefined, decimals: number, displayDecimals: number): string {
  if (value === undefined || value === null) return ""
  const bigIntValue: bigint = typeof value === "string" ? BigInt(value) : value
  const reduceNumber = parseFloat(formatUnits(bigIntValue, decimals))
  if (!isNaN(reduceNumber)) {
    return formatDollar(reduceNumber, displayDecimals)
  }
  return ""
}

/**
 * Formats a big integer value (as a string) into a human-readable decimal format.
 * @param value - The value .
 * @param displayDecimals - The number of decimal places to show in the formatted output.
 * @returns A string representing the formatted value with thousands separators and limited decimal places.
 */
export function formatNumber(value: number | undefined, displayDecimals: number): string {
  if (value === undefined || value === null) return ""
  let num = parseFloat(value?.toString())
  if (isNaN(num)) return ""
  num = Number(num.toFixed(displayDecimals))
  return new Intl.NumberFormat("en-US").format(num)
}

export const formatDisplayValue = (value: string | number): string => {
  const num = Number(value)
  if (isNaN(num)) return ""
  if (Number.isInteger(num)) return num.toString()
  const formatted = num.toFixed(3).replace(/\.?0+$/, "")
  return formatted
}

export const formatBigIntAsNumber = (value: bigint, decimals: number, displayDecimals: number) => {
  return formatNumber(Number(formatUnits(value || 0n, decimals)), displayDecimals)
}

export const formatCompact = (value: string | number): string => {
  const number = typeof value === "string" ? parseFloat(value) : value

  if (isNaN(number)) return "0"

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(2)}B`
  } else if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(2)}M`
  } else if (number >= 1_000) {
    return `${(number / 1_000).toFixed(2)}K`
  } else {
    return `$${number.toFixed(0)}`
  }
}
