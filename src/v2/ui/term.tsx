"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

/** Texts of the live dapp indicators (usg_market_controller, market_details_parameters), reused as is. */
export const TERMS = {
  vapr: "vAPR of the collateral.",
  borrowRate: "Interest rate that borrowers pay on their outstanding debt.",
  maxLevVapr: "Net vAPR at max leverage.",
  rewardsCut: "The percentage of collateral's rewards that are deducted.",
  maxLtv: "Maximum Loan-to-value: represents the maximum borrowable amount compared to the collateral's value.",
  lt: "Liquidation-threshold: the LTV at which your position becomes eligible for liquidation.",
  health: "Health factor of the position. Below 1 the position can be liquidated.",
  liquidationPrice: "Collateral price at which the position becomes eligible for liquidation.",
} as const

/** A label with a definition on hover: dotted underline, live Radix HoverCard. */
export function Term({
  children,
  info,
  align = "start",
  className,
}: {
  children: ReactNode
  info: string
  align?: "start" | "center" | "end"
  className?: string
}) {
  return (
    <HoverCard openDelay={150} closeDelay={80}>
      <HoverCardTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            "w-fit cursor-help underline decoration-white/15 decoration-dotted underline-offset-4 outline-none focus-visible:text-white",
            className
          )}
        >
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent side="top" align={align} className="z-[9999] w-fit max-w-60 rounded-lg border-white/10 bg-raised p-2 text-xs font-normal text-ink-2">
        {info}
      </HoverCardContent>
    </HoverCard>
  )
}
