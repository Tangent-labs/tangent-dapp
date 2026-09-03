"use client"

import { useEffect, useMemo, useRef, useState } from "react"

const MIN_SLOT_PX = 48

const PILLAR_STEPS = [12, 10, 8, 6]

export function useVisiblePeriods<T>(data: T[]) {
  const plotRef = useRef<HTMLDivElement>(null)

  const [plotWidth, setPlotWidth] = useState(0)

  useEffect(() => {
    const plot = plotRef.current
    if (!plot) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setPlotWidth(entry.contentRect.width)
    })
    resizeObserver.observe(plot)

    return () => resizeObserver.disconnect()
  }, [])

  const maxBars = plotWidth > 0 ? Math.floor(plotWidth / MIN_SLOT_PX) : Infinity
  const barCount = PILLAR_STEPS.find((step) => step <= maxBars) ?? PILLAR_STEPS[PILLAR_STEPS.length - 1]
  const visible = useMemo(() => (barCount < data.length ? data.slice(-barCount) : data), [data, barCount])

  return { plotRef, visible }
}
