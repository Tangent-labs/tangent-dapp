"use client"

import { useCallback, useEffect, useSyncExternalStore } from "react"
import { APPEARANCE_KEY, Appearance, DEFAULT_APPEARANCE, LIGHT_QUERY, Theme } from "./constants"

const listeners = new Set<() => void>()

const readAppearance = (): Appearance => {
  try {
    const v = localStorage.getItem(APPEARANCE_KEY)
    return v === "system" || v === "light" || v === "dark" ? v : DEFAULT_APPEARANCE
  } catch {
    return DEFAULT_APPEARANCE
  }
}

const resolveTheme = (a: Appearance): Theme => (a === "system" ? (window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark") : a)

const apply = (a: Appearance) => {
  document.documentElement.dataset.theme = resolveTheme(a)
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const subscribeTheme = (cb: () => void) => {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  return () => mo.disconnect()
}
const readTheme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark")

/** The theme actually on screen, for the few drawings that cannot read CSS variables (canvas charts). */
export function useResolvedTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, readTheme, () => "dark")
}

/** Current appearance and a setter; follows the device while on System. */
export function useAppearance() {
  const appearance = useSyncExternalStore(subscribe, readAppearance, () => DEFAULT_APPEARANCE)

  useEffect(() => {
    if (appearance !== "system") return
    const mq = window.matchMedia(LIGHT_QUERY)
    const onChange = () => apply("system")
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [appearance])

  const setAppearance = useCallback((a: Appearance) => {
    try {
      localStorage.setItem(APPEARANCE_KEY, a)
    } catch {
      // private mode: the choice still applies to this visit
    }
    apply(a)
    listeners.forEach((l) => l())
  }, [])

  return { appearance, setAppearance }
}
