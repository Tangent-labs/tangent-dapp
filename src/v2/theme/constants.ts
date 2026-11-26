/**
 * V2 appearance (Aave Pro style): System, Light or Dark.
 * The choice lives in localStorage; the resolved theme is written on <html data-theme="light|dark">, which switches the
 * --tgt-v2-* tokens in css_globals.css. ThemeScript applies it before the first paint, useAppearance changes it.
 */
export type Appearance = "system" | "light" | "dark"
export type Theme = "light" | "dark"

export const APPEARANCE_KEY = "tgt-appearance"
export const DEFAULT_APPEARANCE: Appearance = "dark"
export const APPEARANCES: { value: Appearance; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]
export const LIGHT_QUERY = "(prefers-color-scheme: light)"
