"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type Details = Record<string, number | undefined>

const pct = (n?: number) => (n === undefined || Number.isNaN(n) ? "-" : `${n.toFixed(2)}%`)
/** the live data uses a negative sentinel (-1) when a protocol has no projection */
const hasProjection = (n?: number) => n !== undefined && !Number.isNaN(n) && n >= 0

/**
 * A vAPR value with its projection underneath and, on hover, the same per-token breakdown the live MarketAPR shows
 * (currentAPRDetails / projectedAPRDetails). Pure display: every number comes from the caller.
 */
export function AprHover({
  name,
  logoKey,
  current,
  projected,
  currentDetails,
  projectedDetails,
  showProjected = true,
  className,
  children,
}: {
  name: string
  logoKey?: string
  current?: number
  projected?: number
  currentDetails?: Details
  projectedDetails?: Details
  showProjected?: boolean
  className?: string
  children?: ReactNode
}) {
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <span className={cn("min-w-0 cursor-help", className)}>
          {children ?? (
            <>
              <span className="block text-[15px] font-semibold tabular-nums leading-5">{pct(current)}</span>
              {showProjected && (
                <span className="mt-1 block text-xs tabular-nums leading-4 text-ink-3">
                  {hasProjection(projected) ? `Proj. ${pct(projected)}` : "No projection"}
                </span>
              )}
            </>
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="z-[9999] w-[240px] rounded-[10px] border-white/10 bg-[#1c1c1f] p-3 text-xs text-white">
        <div className="flex items-center gap-1.5 font-semibold">
          {logoKey && <TokenImage token={logoKey} size={16} className="h-4 w-auto" />} {name}
        </div>
        <Breakdown title="Current vAPR" total={current} details={currentDetails} />
        {showProjected && hasProjection(projected) && <Breakdown title="Projected vAPR" total={projected} details={projectedDetails} />}
      </HoverCardContent>
    </HoverCard>
  )
}

function Breakdown({ title, total, details }: { title: string; total?: number; details?: Details }) {
  const rows = Object.entries(details ?? {}).filter(([, v]) => (v ?? 0) >= 0.01)
  return (
    <div className="mt-2.5">
      <div className="flex justify-between border-b border-white/10 pb-1 font-semibold">
        <span>{title}</span>
        <span className="tabular-nums">{pct(total)}</span>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} className="mt-1 flex justify-between text-ink-2">
          <span>{k === "APY" ? "Base APY" : `${k} APR`}</span>
          <span className="tabular-nums">{pct(v)}</span>
        </div>
      ))}
    </div>
  )
}
