"use client"

import { UI_V2 } from "@/v2/ui"
import { useResolvedTheme } from "./use-appearance"

/**
 * Light theme and logos.
 * - White glyphs on transparency (Convex, Stake DAO, and the Llama, Dewhales, Resupply boosts) get an ink copy in
 *   /medias/<folder>-light/ (white parts that touch the outside recoloured, colours kept).
 * - Logos drawn on a white disc or white background get Aave Pro's grey hairline ring (data-ring, css_globals.css),
 *   so the disc keeps its edge on a white page. Every other logo is left untouched.
 * Both lists come from an analysis of the files' edges (white share of the outer edge); refresh them when logos change.
 */
const LIGHT_VARIANTS = new Set([
  "/medias/tokens/CVX.webp",
  "/medias/tokens/SDT.webp",
  "/medias/logos/CVX.webp",
  "/medias/logos/SDT.webp",
  "/medias/logos/Stake.webp",
  "/medias/logos/Llama.webp",
  "/medias/logos/Dewhales.webp",
  "/medias/logos/Resupply.webp",
])

const WHITE_EDGE = new Set(
  [
    "CVX-ETH",
    "FRAX-USDC",
    "FXN",
    "RLUSD",
    "WETH",
    "dETH-frxETH",
    "eUSD",
    "frxETH-ETH",
    "frxUSD",
    "fxUSD",
    "pxETH-frxETH",
    "sUSG-frxUSD",
    "sUSG",
    "sUSGdo",
    "sUSGfr",
    "sUSGou",
    "sUSGre",
    "sUSGus",
    "sdCRV",
    "stETH",
    "triCRV",
    "veCRV",
  ]
    .map((n) => `/medias/tokens/${n}.webp`)
    .concat(["/medias/tokens/sUSG-logo.png", "/medias/logos/FX.webp"])
)

export const lightLogoSrc = (src: string) => (LIGHT_VARIANTS.has(src) ? src.replace(/^\/medias\/(tokens|logos)\//, "/medias/$1-light/") : src)

/** Logos on a white disc: they get the grey ring on the light theme. */
export const hasWhiteEdge = (src: string) => WHITE_EDGE.has(src)

/** The logo to show for the theme on screen. */
export function useThemedLogo(src: string) {
  const theme = useResolvedTheme()
  return UI_V2 && theme === "light" ? lightLogoSrc(src) : src
}
