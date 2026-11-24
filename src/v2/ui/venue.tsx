"use client"

import { cn } from "@/lib/utils"
import { TokenImage } from "@/components/design_system/structure/token_image"

/**
 * Where a market's collateral lives, as [logo, label] pairs, keyed by the live marketType.
 * Same protocols as the live list (TYPE_TO_MARKET in usg_market_controller), shortened: Convex FXN markets also run on f(x).
 * Logos are protocol tokens already in /medias/tokens.
 */
export const VENUE: Record<string, [string, string][]> = {
  Convex_CRV: [
    ["CRV", "Curve"],
    ["CVX", "Convex"],
  ],
  Convex_FXN: [
    ["CRV", "Curve"],
    ["CVX", "Convex"],
    ["FXN", "f(x)"],
  ],
  STAKEDAO_CRV_Vault: [
    ["CRV", "Curve"],
    ["SDT", "Stake DAO"],
  ],
  CRV_Gauge: [["CRV", "Curve"]],
  Pendle_PT: [["PENDLE", "Pendle"]],
}

/** "(Curve) Curve · (Convex) Convex": each protocol logo before its name. Falls back to the raw type. */
export function Venue({ type, className }: { type: string; className?: string }) {
  const parts = VENUE[type]
  if (!parts) return type ? <span className={cn("truncate", className)}>{type}</span> : null
  return (
    <span className={cn("flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap", className)}>
      {parts.map(([logo, label], i) => (
        <span key={label} className="flex items-center gap-1.5">
          {i > 0 && <span className="opacity-50">·</span>}
          <TokenImage token={logo} size={12} className="h-3 w-3 shrink-0 rounded-full" />
          {label}
        </span>
      ))}
    </span>
  )
}
