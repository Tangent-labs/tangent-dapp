/**
 * V2 colours for code (SVG attributes, recharts props, inline styles). Each one points at a --tgt-v2-* token from
 * css_globals.css, so charts and drawings follow the Light / Dark appearance like the Tailwind classes do.
 * Never concatenate an alpha onto these (they are var() strings): use stopOpacity / fillOpacity / opacity instead.
 */
export const COLOR = {
  // text
  fg: "var(--tgt-v2-text-primary)",
  ink2: "var(--tgt-v2-text-secondary)",
  ink3: "var(--tgt-v2-text-tertiary)",
  // surfaces
  surface: "var(--tgt-v2-bg-surface)",
  raised: "var(--tgt-v2-bg-raised)",
  // data
  data: "var(--tgt-v2-data-primary)",
  projected: "var(--tgt-v2-data-projected)",
  negative: "var(--tgt-v2-data-negative)",
  warning: "var(--tgt-v2-status-warning)",
  // chart furniture
  grid: "var(--tgt-v2-border-divider)",
  ring: "var(--tgt-v2-chart-ring)",
  line: "var(--tgt-v2-chart-line)",
  cursor: "var(--tgt-v2-chart-cursor)",
  track: "var(--tgt-v2-chart-track)",
} as const

/** Data series after the blue: quiet tints, darker on the light theme. No green, no yellow. */
export const SERIES = {
  blue: COLOR.data,
  violet: "var(--tgt-v2-series-violet)",
  pink: "var(--tgt-v2-series-pink)",
  gold: "var(--tgt-v2-series-gold)",
  slate: "var(--tgt-v2-series-slate)",
} as const
