import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const bigIntSerialize = (_: unknown, value: unknown): unknown => (typeof value === "bigint" ? value.toString() : value)

export const JSONdebug = (data: unknown) => {
  return JSON.stringify(data, bigIntSerialize, 2) // Pretty-print with 2-space indentation
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}
