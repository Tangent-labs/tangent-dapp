// Organic blue gradient generated from a wallet address.
// Same technique as the drifting gradient of the Tangent landing buttons: a "cloud" field made of six
// sine waves at different angles / frequencies, mapped on a ramp of blues close to Tangent's #0075ff.
// Everything is derived from the address, so a wallet always gets the same look.

type RGB = [number, number, number]

// Wave angles / frequencies of the landing buttons shader
const BASE_WAVES: [number, number, number][] = [
  [1.22, -0.85, 0.451],
  [0.76, 1.52, 0.621],
  [0.81, -0.93, 0.221],
  [0.32, 0.53, 0.539],
  [1.36, -0.62, 0.917],
  [0.68, 1.21, 0.891],
]

const FREQUENCY = 50
const AMPLITUDE = 0.41

export type WalletGradient = {
  deep: RGB
  mid: RGB
  light: RGB
  accent: RGB
  // Share of the accent (cyan) tint, so some wallets are calmer than others
  accentStrength: number
  waves: [number, number, number][]
  accentWaves: [number, number, number][]
  // Area of the field shown on the avatar (bigger = more blobs)
  zoom: number
  offset: [number, number]
  speed: number
  phase: number
}

// ---------------------------
// Seeded random: same address gives the same numbers
// ---------------------------
const hashAddress = (address: string) => {
  // FNV-1a
  let hash = 2166136261
  for (const char of address.toLowerCase()) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const createRandom = (seed: number) => {
  // mulberry32
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const between = (random: () => number, min: number, max: number) => min + random() * (max - min)

const hslToRgb = (h: number, s: number, l: number): RGB => {
  const a = s * Math.min(l, 1 - l)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
  }
  return [channel(0), channel(8), channel(4)]
}

// Tangent blue #0075ff is around hue 213, its light cyan #00c2ff around 194
const TANGENT_BLUE_HUE = 213
const TANGENT_CYAN_HUE = 194

const randomWaves = (random: () => number): [number, number, number][] =>
  BASE_WAVES.map(([x, y, f]) => [x * between(random, 0.8, 1.2), y * between(random, 0.8, 1.2), f * between(random, 0.85, 1.15)])

export const getWalletGradient = (address: string): WalletGradient => {
  const random = createRandom(hashAddress(address))
  const hue = TANGENT_BLUE_HUE + between(random, -8, 8)

  return {
    deep: hslToRgb(hue + between(random, -6, 6), 1, between(random, 0.1, 0.18)),
    mid: hslToRgb(hue + between(random, -8, 8), 1, between(random, 0.32, 0.44)),
    light: hslToRgb(hue + between(random, -10, 4), 1, between(random, 0.56, 0.66)),
    accent: hslToRgb(TANGENT_CYAN_HUE + between(random, -6, 6), 1, between(random, 0.5, 0.58)),
    accentStrength: between(random, 0.25, 0.7),
    waves: randomWaves(random),
    accentWaves: randomWaves(random),
    zoom: between(random, 0.045, 0.085),
    offset: [between(random, 0, 4), between(random, 0, 4)],
    speed: between(random, 0.3, 0.55),
    phase: between(random, 0, Math.PI * 2),
  }
}

// ---------------------------
// Rendering
// ---------------------------
const cloudField = (ux: number, uy: number, t: number, waves: [number, number, number][]) => {
  let sum = 0
  for (const [wx, wy, wf] of waves) sum += Math.sin((ux * wx + uy * wy) * FREQUENCY * wf + t) * AMPLITUDE
  return sum * 0.5 + 0.5
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp01((value - edge0) / (edge1 - edge0))
  return x * x * (3 - 2 * x)
}

const mix = (a: RGB, b: RGB, amount: number): RGB => [a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount, a[2] + (b[2] - a[2]) * amount]

// Fills an RGBA buffer (width x height) with the gradient at the given time (in seconds)
export const paintWalletGradient = (data: Uint8ClampedArray, width: number, height: number, gradient: WalletGradient, seconds: number) => {
  const t = seconds * gradient.speed + gradient.phase
  let k = 0

  for (let y = 0; y < height; y++) {
    const uy = gradient.offset[1] + (1 - (y + 0.5) / height) * gradient.zoom

    for (let x = 0; x < width; x++) {
      const ux = gradient.offset[0] + ((x + 0.5) / width) * gradient.zoom

      const v = clamp01(cloudField(ux, uy, t, gradient.waves))
      const base = v < 0.5 ? mix(gradient.deep, gradient.mid, v * 2) : mix(gradient.mid, gradient.light, (v - 0.5) * 2)

      const accentAmount = smoothstep(0.55, 1, cloudField(ux, uy, t * 0.7, gradient.accentWaves)) * gradient.accentStrength
      const [r, g, b] = mix(base, gradient.accent, accentAmount)

      data[k++] = r
      data[k++] = g
      data[k++] = b
      data[k++] = 255
    }
  }
}
