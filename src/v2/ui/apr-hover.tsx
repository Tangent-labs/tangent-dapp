"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { AprMark } from "./apr-mark"
import { HoverInfo } from "./info-sheet"

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
    <span className={cn("min-w-0", className)}>
      <HoverInfo
        title={
          <span className="flex items-center gap-1.5">
            {logoKey && <TokenImage token={logoKey} size={20} className="h-5 w-auto" />} {name}
          </span>
        }
        contentClassName="w-[240px]"
        trigger={
          children ? (
            <span className="group/apr inline-block w-fit">{children}</span>
          ) : (
            <span className="group/apr inline-flex w-fit items-center gap-1 text-[15px] font-semibold tabular-nums leading-5 transition-colors hover:text-action">
              {pct(current)}
              <AprMark />
            </span>
          )
        }
        content={
          <div className="text-[14px] text-white md:text-xs [&>div:first-child]:hidden md:[&>div:first-child]:flex">
            <div className="items-center gap-1.5 font-semibold">
              {logoKey && <TokenImage token={logoKey} size={16} className="h-4 w-auto" />} {name}
            </div>
            <Breakdown title="Current vAPR" total={current} details={currentDetails} />
            {showProjected && hasProjection(projected) && <Breakdown title="Projected vAPR" total={projected} details={projectedDetails} />}
          </div>
        }
      />
      {!children && showProjected && (
        <span className="mt-1 block text-xs tabular-nums leading-4 text-ink-3">{hasProjection(projected) ? `Proj. ${pct(projected)}` : "No projection"}</span>
      )}
    </span>
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
