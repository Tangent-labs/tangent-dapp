"use client"

import { UI_V2 } from "@/v2/ui"
import { useResolvedTheme } from "./use-appearance"

/**
 * Light theme and logos.
 * - Convex and Stake DAO are white glyphs on transparency: they get an ink copy in /medias/<folder>-light/.
 * - Every other logo stays as it is; round ones get a hairline ring on the light theme (Aave Pro), see markDisc.
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

/**
 * onLoad handler: flags a logo that is a full disc (opaque all around its edge) with data-disc, so the light theme can
 * ring it. Curve, LP pairs and other shapes are left alone (a ring would crop or float around them).
 */
export function markDisc(img: HTMLImageElement) {
  if (!UI_V2 || img.dataset.disc !== undefined) return
  try {
    const n = 32
    const c = document.createElement("canvas")
    c.width = c.height = n
    const ctx = c.getContext("2d", { willReadFrequently: true })
    if (!ctx || !img.naturalWidth || Math.abs(img.naturalWidth - img.naturalHeight) > 1) return void (img.dataset.disc = "0")
    ctx.drawImage(img, 0, 0, n, n)
    const { data } = ctx.getImageData(0, 0, n, n)
    let disc = true
    for (let i = 0; i < 16 && disc; i++) {
      const a = (i / 16) * Math.PI * 2
      const x = Math.round(n / 2 - 0.5 + Math.cos(a) * n * 0.44)
      const y = Math.round(n / 2 - 0.5 + Math.sin(a) * n * 0.44)
      if (data[(y * n + x) * 4 + 3] < 200) disc = false
    }
    img.dataset.disc = disc ? "1" : "0"
  } catch {
    img.dataset.disc = "0"
  }
}
