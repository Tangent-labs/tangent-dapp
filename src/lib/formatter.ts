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
  // Convert the input value (a string) into a BigInt for precise calculations.

  if (value === undefined || value === null) return ""

  const bigIntValue: bigint = typeof value === "string" ? BigInt(value) : value

  // Calculate the divisor, which is 10^decimals, to scale the value down to its proper decimal representation.
  const divisor = BigInt(10 ** decimals)

  // Divide the bigIntValue by the divisor to get the integer part.
  const integerPart = bigIntValue / divisor

  // Calculate the fractional part using the modulus operator (%) to get the remainder of the division.
  const fractionalPart = bigIntValue % divisor

  // Convert the fractional part to a string, pad it with leading zeros if necessary, and limit it to displayDecimals digits.
  const fractionalPartString = fractionalPart
    .toString()
    .padStart(decimals, "0") // Ensures leading zeros if the fractional part is smaller than expected
    .slice(0, displayDecimals) // Limits the number of decimals to displayDecimals

  // Format the integer part using the "en-US" locale, which adds thousands separators for readability (e.g., 1,000,000).
  const formattedIntegerPart = new Intl.NumberFormat("en-US").format(Number(integerPart))

  // Combine the formatted integer part and the fractional part into the final formatted output and return it.
  return `${formattedIntegerPart}.${fractionalPartString}`
}
