import { useLayoutEffect, useRef } from "react"

export function useAutoGrowInputWidth(value: string | number, options?: { placeholder?: string; minPx?: number }) {
  const { placeholder = "Amount", minPx = 32 } = options || {}

  const inputRef = useRef<HTMLInputElement | null>(null)
  const inputSpanRef = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(() => {
    const input = inputRef.current
    const measurer = inputSpanRef.current
    if (!input || !measurer) return

    // If browser supports field-sizing, basically do nothing
    const supportsFieldSizing = typeof CSS !== "undefined" && CSS.supports?.("field-sizing: content")
    if (supportsFieldSizing) {
      input.style.width = ""
      return
    }

    const text = value === "" || value === null || value === undefined ? placeholder : String(value)

    measurer.textContent = text

    const width = Math.ceil(measurer.getBoundingClientRect().width)
    input.style.width = `${Math.max(width, minPx)}px`
  }, [value, placeholder, minPx])

  return { inputRef, inputSpanRef }
}
