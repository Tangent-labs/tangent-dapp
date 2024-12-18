import { DependencyList, useEffect, useRef } from "react"

// A simple custom debounce hook
export function useEffectDebounce(callback: () => void, deps: DependencyList, delay: number = 200) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Schedule the callback after the specified delay
    timeoutRef.current = setTimeout(() => {
      callback()
    }, delay)

    // Cleanup: clear existing timeout whenever dependencies change or component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [...deps, delay]) // Include delay so the effect re-runs if it changes
}
