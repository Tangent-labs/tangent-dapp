"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { formatDollar } from "@/lib/number_formatter"
import { ProtocolRevenue, RevenueRange } from "../../usg_type"
import { Divider } from "@/components/design_system/structure/divider"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { InnerTooltip } from "@/components/design_system/structure/inner_tooltip"
import { useGraphPeriodSelection } from "@/hooks/useGraphPeriodSelection"
import { formatPeriodLabel, formatYAxis, computeYAxisTicks } from "../dashboard_controller"

type GraphProtocolRevenuesProps = {
  protocolRevenues: ProtocolRevenue[]
  selectedRevenueTab: RevenueRange
  fetchRevenues: (range: RevenueRange) => void
  totalRevenues: number
}

const REVENUE_RANGE_TABS: { label: string; range: RevenueRange }[] = [
  { label: "1w", range: "week" },
  { label: "1m", range: "month" },
]

const RevenueBreakdown = ({ revenue }: { revenue: ProtocolRevenue }) => (
  <>
    <div className="font-semibold text-white">{revenue.period}</div>

    <div className="flex w-full items-center justify-between gap-4">
      <div className="text-subtitle">Interest</div>
      <div className="text-white">{formatDollar(revenue.ir)}</div>
    </div>

    <div className="flex w-full items-center justify-between gap-4">
      <div className="text-subtitle">Rewards</div>
      <div className="text-white">{formatDollar(revenue.reward)}</div>
    </div>

    <div className="flex w-full items-center justify-between gap-4 border-t border-white/10 pt-1">
      <div className="text-subtitle">Total</div>
      <div className="font-semibold text-white">{formatDollar(revenue.total)}</div>
    </div>
  </>
)

export const GraphProtocolRevenues = ({ totalRevenues, protocolRevenues, selectedRevenueTab, fetchRevenues }: GraphProtocolRevenuesProps) => {
  const { cardRef, isDesktop, selectedPeriod, toggleSelection } = useGraphPeriodSelection(protocolRevenues)

  const { ticks, axisMax } = useMemo(() => computeYAxisTicks(Math.max(0, ...protocolRevenues.map((el) => el?.total ?? 0))), [protocolRevenues])

  const selectedRevenue = protocolRevenues.find((el) => el?.period === selectedPeriod) ?? null

  return (
    <ReliefCard ref={cardRef} className="flex w-full flex-col items-start justify-start p-5">
      <div className="flex w-full items-center justify-between">
        <div className="text-xl font-semibold">Protocol revenues</div>

        <div className="flex gap-3">
          {REVENUE_RANGE_TABS.map((tab) => (
            <ButtonTab
              key={tab.range}
              onClick={() => fetchRevenues(tab.range)}
              label={tab.label}
              active={selectedRevenueTab === tab.range}
              className="rounded-full !py-1"
            />
          ))}
        </div>
      </div>

      <Divider />

      <div className="mb-4 flex items-center justify-start gap-1 text-xs">
        <div className="text-subtitle">Total: </div>
        <div className="font-semibold text-white">{formatDollar(totalRevenues, 0)}</div>
      </div>

      <div className="w-full pr-12">
        <div className="relative h-44 w-full">
          {ticks.map((tick) => (
            <div key={tick} className="pointer-events-none absolute inset-x-0" style={{ bottom: `${(tick / axisMax) * 100}%` }}>
              <div className="h-px w-full bg-white/[0.06]" />
              <span className="absolute left-full top-1/2 w-12 -translate-y-1/2 whitespace-nowrap pl-1.5 text-[10px] text-subtitle sm:w-16 sm:pl-2 sm:text-xs">
                {formatYAxis(tick)}
              </span>
            </div>
          ))}

          <div className="absolute inset-0 flex items-end transition-opacity duration-200">
            {protocolRevenues.map((el) => {
              const isSelected = !isDesktop && el?.period === selectedPeriod
              const isDimmed = !isDesktop && selectedPeriod !== null && !isSelected

              // Below `md` only: the bar becomes a toggle for the panel below
              const touchProps = isDesktop
                ? {}
                : {
                    role: "button",
                    tabIndex: 0,
                    "aria-pressed": isSelected,
                    "aria-label": `${el?.period} revenue details`,
                    onClick: () => toggleSelection(el?.period),
                  }

              const bar = (
                <div
                  key={el?.period}
                  {...touchProps}
                  className={cn(
                    "group flex h-full flex-1 cursor-pointer items-end justify-center outline-none transition-opacity duration-200",
                    isDimmed && "opacity-40"
                  )}
                >
                  <div className={cn("relative h-full w-2 overflow-hidden rounded-full bg-white/[0.08]", isSelected && "ring-1 ring-white/40")}>
                    <div
                      className="absolute bottom-0 left-0 w-full rounded-full bg-[#0075FF] transition-all duration-300 group-hover:bg-[#3B93FF]"
                      style={{ height: `${el?.total > 0 ? (el.total / axisMax) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )

              // Hover tooltip is desktop-only: on touch, a tap would open it on top of the details panel
              if (!isDesktop) return bar

              return (
                <InnerTooltip
                  key={el?.period}
                  innerContent={<div className="flex min-w-32 flex-col items-start justify-center gap-1 px-4">{el && <RevenueBreakdown revenue={el} />}</div>}
                >
                  {bar}
                </InnerTooltip>
              )
            })}
          </div>
        </div>

        <div className="mt-2 flex w-full">
          {protocolRevenues.map((el) => (
            <span key={el?.period} className="flex-1 text-center text-[10px] text-subtitle">
              {formatPeriodLabel(el?.period, selectedRevenueTab)}
            </span>
          ))}
        </div>
      </div>

      {!isDesktop && selectedRevenue && (
        <div className="mt-4 flex w-full flex-col gap-1 rounded-[10px] bg-overlay-panel p-3 text-xs">
          <RevenueBreakdown revenue={selectedRevenue} />
        </div>
      )}
    </ReliefCard>
  )
}
