import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const bigIntSerialize = (_: unknown, value: unknown): unknown => (typeof value === "bigint" ? value.toString() : value)
