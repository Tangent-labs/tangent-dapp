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

/**
 * "(Curve) Curve · (Convex) Convex": each protocol logo before its name. Falls back to the raw type.
 * `dense` (list rows): no dot separators, the logos already split the names, so three venues fit the name column.
 */
export function Venue({ type, className, dense }: { type: string; className?: string; dense?: boolean }) {
  const parts = VENUE[type]
  if (!parts) return type ? <span className={cn("truncate", className)}>{type}</span> : null
  return (
    <span className={cn("flex min-w-0 items-center overflow-hidden whitespace-nowrap", dense ? "gap-2" : "gap-1.5", className)}>
      {parts.map(([logo, label], i) => (
        <span key={label} className={cn("flex items-center", dense ? "gap-1" : "gap-1.5")}>
          {i > 0 && !dense && <span className="opacity-50">·</span>}
          <TokenImage token={logo} size={12} className="h-3 w-3 shrink-0 object-contain" />
          {label}
        </span>
      ))}
    </span>
  )
}
