"use client"

import { useState } from "react"
import Cookies from "js-cookie"

export function useCookieState<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      // Avoid issues during server-side rendering
      return initialValue
    }

    // For client-side rendering, get the value from cookies
    const cookieValue = Cookies.get(key)
    return cookieValue ? (JSON.parse(cookieValue) as T) : initialValue
  })

  const setValue = (arg: T) => {
    setStoredValue(arg)
    if (typeof window !== "undefined") {
      Cookies.set(key, JSON.stringify(arg), { path: "/" })
    }
  }

  return [storedValue, setValue] as const
}
