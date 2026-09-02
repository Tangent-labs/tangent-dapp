"use client"

import { useEffect, useRef, useState } from "react"

const DESKTOP_MIN_WIDTH_PX = 768

// Below `md`, dashboard graph bars become tap-toggles for a details panel instead of hover tooltips
export function useGraphPeriodSelection(data: unknown[]) {
  const cardRef = useRef<HTMLDivElement>(null)

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)

  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const desktopQuery = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH_PX}px)`)
    const onChange = () => setIsDesktop(desktopQuery.matches)
    onChange()
    desktopQuery.addEventListener("change", onChange)

    return () => desktopQuery.removeEventListener("change", onChange)
  }, [])

  // A new range or a refetch invalidates the selected period
  useEffect(() => {
    setSelectedPeriod(null)
  }, [data])

  // A tap anywhere outside the card closes the details panel
  useEffect(() => {
    if (isDesktop || selectedPeriod === null) return

    const onPointerDown = (event: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setSelectedPeriod(null)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)

    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isDesktop, selectedPeriod])

  const toggleSelection = (period: string) => setSelectedPeriod((current) => (current === period ? null : period))

  return { cardRef, isDesktop, selectedPeriod, toggleSelection }
}
