"use client"

import { UI_V2 } from "@/v2/ui"
import { useResolvedTheme } from "./use-appearance"

/**
 * Light theme and logos.
 * - Convex and Stake DAO are white glyphs on transparency: they get an ink copy in /medias/<folder>-light/.
 * - Every other logo stays as it is. All logos carry data-logo and get a hairline outline on the light theme
 *   (css_globals.css), which follows their own shape.
 */
const LIGHT_VARIANTS = new Set([
  "/medias/tokens/CVX.webp",
  "/medias/tokens/SDT.webp",
  "/medias/logos/CVX.webp",
  "/medias/logos/SDT.webp",
  "/medias/logos/Stake.webp",
])

export const lightLogoSrc = (src: string) => (LIGHT_VARIANTS.has(src) ? src.replace(/^\/medias\/(tokens|logos)\//, "/medias/$1-light/") : src)

/** The logo to show for the theme on screen. */
export function useThemedLogo(src: string) {
  const theme = useResolvedTheme()
  return UI_V2 && theme === "light" ? lightLogoSrc(src) : src
}
