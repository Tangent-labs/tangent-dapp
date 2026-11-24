"use client"

import { UI_V2 } from "@/v2/ui"
import { useResolvedTheme } from "./use-appearance"

/**
 * Logos drawn in white on a transparent background (Convex, Stake DAO, Llama...) disappear on the light theme.
 * Each one has an ink copy in /medias/<folder>-light/ (white parts that touch the outside recoloured, colours kept),
 * generated from the originals. Logos whose white is a disc or sits inside a coloured shape keep their original.
 */
const LIGHT_VARIANTS = new Set([
  "/medias/tokens/CVX.webp",
  "/medias/tokens/SDT.webp",
  "/medias/tokens/LDO.webp",
  "/medias/tokens/balancer.webp",
  "/medias/tokens/morpho.webp",
  "/medias/tokens/spectra.webp",
  "/medias/tokens/tBTC.webp",
  "/medias/logos/CVX.webp",
  "/medias/logos/Dewhales.webp",
  "/medias/logos/Llama.webp",
  "/medias/logos/Resupply.webp",
  "/medias/logos/SDT.webp",
  "/medias/logos/Stake.webp",
])

export const lightLogoSrc = (src: string) => (LIGHT_VARIANTS.has(src) ? src.replace(/^\/medias\/(tokens|logos)\//, "/medias/$1-light/") : src)

/** The logo to show for the theme on screen. */
export function useThemedLogo(src: string) {
  const theme = useResolvedTheme()
  return UI_V2 && theme === "light" ? lightLogoSrc(src) : src
}
