// Tangent signature texture: grid cells cut with the exact petals of tangent-logo.svg.
// The void at every crossing draws the logo. Hero cards only, faded from the top-right corner.

const C1: Array<[number, number, number, number, number, number]> = [
  [45.7493, 40.0763, 44.6894, 40.191, 43.6584, 40.344],
  [34.9094, 41.6541, 28.2319, 46.0529, 25.2064, 59.8325],
  [24.0501, 65.0727, 23.4335, 71.6804, 23.4238, 79.9902],
]
const S1: [number, number] = [46.8381, 39.9998]
const C2: Array<[number, number, number, number, number, number]> = [
  [1.08881, 39.9235, 2.14872, 39.8087, 3.17972, 39.6557],
  [11.9288, 38.3457, 18.6062, 33.9469, 21.6317, 20.1673],
  [22.788, 14.9271, 23.4047, 8.31939, 23.4143, 0.00956],
]
const S2: [number, number] = [0, 40]
const CX = 23.4143
const CY = 40
const W = 46.8381
const H = 80

function reversed(start: [number, number], segs: typeof C1) {
  const pts: Array<[number, number]> = [start, ...segs.map((s) => [s[4], s[5]] as [number, number])]
  const out: Array<[number, number, number, number, number, number]> = []
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i]
    out.push([s[2], s[3], s[0], s[1], pts[i][0], pts[i][1]])
  }
  return out
}

function cellPath(s: number) {
  const w = W * s
  const h = H * s
  const f = (n: number) => n.toFixed(2)
  const A = (x: number, y: number) => `${f((x - CX) * s)} ${f((y - CY) * s)}`
  const B = (x: number, y: number) => `${f(w + (x - CX) * s)} ${f(h + (y - CY) * s)}`
  let d = `M${A(S1[0], S1[1])} L${f(w)} 0 L${B(23.4143, 0.00956)}`
  for (const g of reversed(S2, C2)) d += ` C${B(g[0], g[1])} ${B(g[2], g[3])} ${B(g[4], g[5])}`
  d += ` L0 ${f(h)} L${A(23.4238, 79.9902)}`
  for (const g of reversed(S1, C1)) d += ` C${A(g[0], g[1])} ${A(g[2], g[3])} ${A(g[4], g[5])}`
  return d + " Z"
}

const SCALE = 0.42
const GAP = 1.5
const PATH = cellPath(SCALE)

export function VoidTexture({ id }: { id: string }) {
  const pw = W * SCALE + GAP
  const ph = H * SCALE + GAP
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <pattern id={`${id}-p`} width={pw} height={ph} patternUnits="userSpaceOnUse">
          <path d={PATH} fill="white" />
        </pattern>
        <radialGradient id={`${id}-g`} cx="1" cy="0" r="0.75">
          <stop offset="0" stopColor="white" stopOpacity="0.075" />
          <stop offset="0.55" stopColor="white" stopOpacity="0.02" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-m`}>
          <rect width="100%" height="100%" fill={`url(#${id}-g)`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-p)`} mask={`url(#${id}-m)`} style={{ filter: "brightness(1)" }} />
    </svg>
  )
}
