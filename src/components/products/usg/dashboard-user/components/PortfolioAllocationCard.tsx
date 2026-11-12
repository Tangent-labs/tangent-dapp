"use client"

import { cn } from "@/lib/utils"
import { formatDollar } from "@/lib/number_formatter"
import { Title } from "@/components/design_system/structure/title"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { Separator } from "./Separator"
import { RollingNumber } from "./RollingNumber"
import { AllocationGauge } from "./AllocationGauge"
import { getAllocationColor, getSharePercent } from "../dashboard_user_controller"
import type { AllocationItem } from "../dashboard_user_type"

// Empty rows of the legend, so the card keeps its layout when there is nothing to show
const EMPTY_LEGEND = [0, 1, 2, 3, 4]

type PortfolioAllocationCardProps = {
  items: AllocationItem[]
}

export const PortfolioAllocationCard = ({ items }: PortfolioAllocationCardProps) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const isEmpty = items.length === 0

  return (
    <ReliefCard className="flex w-full flex-1 flex-col gap-2.5 p-5">
      <Title label="Portfolio Allocation" size="normal" />

      <Separator />

      <div className="flex w-full flex-1 flex-col items-center gap-5 md:flex-row md:items-stretch">
        <div className="flex w-full items-center md:flex-[1.25]">
          <AllocationGauge items={items} isEmpty={isEmpty}>
            <span className="text-xs text-subtitle">Deposited</span>
            <span className={cn("text-[32px] font-semibold xl:text-4xl", isEmpty && "text-white/40")}>
              <RollingNumber value={total} format={(v) => formatDollar(v)} />
            </span>
          </AllocationGauge>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-[5px] md:min-w-[210px] md:flex-1">
          {isEmpty && EMPTY_LEGEND.map((key) => <div key={key} aria-hidden className="min-h-[30px] rounded-[10px] bg-overlay-panel md:flex-1" />)}

          {items.map((item, index) => (
            <div
              key={item.key}
              className="flex min-h-[30px] items-center justify-between rounded-[10px] bg-overlay-panel px-2.5 text-xs backdrop-blur-[60px] md:flex-1"
            >
              <div className="flex min-w-0 items-center gap-[5px]">
                <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: getAllocationColor(item.key, index) }} />
                <span className="truncate text-subtitle">
                  {item.label} - <span className="font-semibold text-white">{formatDollar(item.amount, 0)}</span>
                </span>
              </div>

              <span className="font-semibold">{Math.round(getSharePercent(item.amount, total))}%</span>
            </div>
          ))}
        </div>
      </div>
    </ReliefCard>
  )
}
