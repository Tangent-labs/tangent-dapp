"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { formatDollar } from "@/lib/number_formatter"
import { ProtocolVolume, VolumeRange } from "../../usg_type"
import { Divider } from "@/components/design_system/structure/divider"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { InnerTooltip } from "@/components/design_system/structure/inner_tooltip"
import { formatPeriodLabel, formatYAxis, computeYAxisTicks } from "../dashboard_controller"

type GraphProtocolVolumesProps = {
  protocolVolumes: ProtocolVolume[]
  selectedVolumeTab: VolumeRange
  fetchVolumes: (range: VolumeRange) => void
  totalVolumes: number
}

const VOLUME_RANGE_TABS: { label: string; range: VolumeRange }[] = [
  { label: "1d", range: "day" },
  { label: "1w", range: "week" },
  { label: "1m", range: "month" },
]

const VOLUME_CATEGORIES: { key: string; label: string; color: string; value: (el: ProtocolVolume) => number }[] = [
  { key: "collateral", label: "Collateral", color: "#3E9B78", value: (el) => el.collateralIn + el.collateralOut },
  { key: "debt", label: "Debt", color: "#3F7FD1", value: (el) => el.debtIn + el.debtOut },
  { key: "lpLiquidity", label: "LP liquidity", color: "#C46A45", value: (el) => el.lpLiquidityIn + el.lpLiquidityOut },
  { key: "lpSwap", label: "LP swaps", color: "#8672C9", value: (el) => el.lpSwap },
  { key: "susg", label: "sUSG", color: "#D8CF4A", value: (el) => el.susgIn + el.susgOut },
]

const PLOT_HEIGHT_PX = 256
const MIN_SEGMENT_PX = 1

const MIN_SLOT_PX = 44

const DESKTOP_MIN_WIDTH_PX = 768

const stackSegments = (el: ProtocolVolume, axisMax: number) => {
  const barPx = axisMax > 0 && el.total > 0 ? (el.total / axisMax) * PLOT_HEIGHT_PX : 0

  return VOLUME_CATEGORIES.map((category) => {
    const value = category.value(el)
    const px = value > 0 ? Math.max(MIN_SEGMENT_PX, (value / el.total) * barPx) : 0
    return { ...category, value, px }
  })
}

// Same breakdown in the hover tooltip and in the tap-to-open panel
const VolumeBreakdown = ({ volume }: { volume: ProtocolVolume }) => (
  <>
    <div className="font-semibold text-white">{volume.period}</div>

    {VOLUME_CATEGORIES.map((category) => (
      <div key={category.key} className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-subtitle">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
          {category.label}
        </div>
        <div className="text-white">{formatDollar(category.value(volume))}</div>
      </div>
    ))}

    <div className="flex w-full items-center justify-between gap-4 border-t border-white/10 pt-1">
      <div className="text-subtitle">Total</div>
      <div className="font-semibold text-white">{formatDollar(volume.total)}</div>
    </div>
  </>
)

export const GraphProtocolVolumes = ({ totalVolumes, protocolVolumes, selectedVolumeTab, fetchVolumes }: GraphProtocolVolumesProps) => {
  const cardRef = useRef<HTMLDivElement>(null)

  const plotRef = useRef<HTMLDivElement>(null)

  const [plotWidth, setPlotWidth] = useState(0)

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)

  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const desktopQuery = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH_PX}px)`)
    const onChange = () => setIsDesktop(desktopQuery.matches)
    onChange()
    desktopQuery.addEventListener("change", onChange)

    return () => desktopQuery.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    const plot = plotRef.current
    if (!plot) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setPlotWidth(entry.contentRect.width)
    })
    resizeObserver.observe(plot)

    return () => resizeObserver.disconnect()
  }, [])

  // A new range or a refetch invalidates the selected period
  useEffect(() => {
    setSelectedPeriod(null)
  }, [protocolVolumes])

  // A tap anywhere outside the card closes the details panel
  useEffect(() => {
    if (isDesktop || selectedPeriod === null) return

    const onPointerDown = (event: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setSelectedPeriod(null)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)

    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isDesktop, selectedPeriod])

  const maxBars = plotWidth > 0 ? Math.max(1, Math.floor(plotWidth / MIN_SLOT_PX)) : Infinity
  const visibleVolumes = useMemo(() => (maxBars < protocolVolumes.length ? protocolVolumes.slice(-maxBars) : protocolVolumes), [protocolVolumes, maxBars])

  const { ticks, axisMax } = useMemo(() => computeYAxisTicks(Math.max(0, ...visibleVolumes.map((el) => el?.total ?? 0))), [visibleVolumes])

  const selectedVolume = visibleVolumes.find((el) => el?.period === selectedPeriod) ?? null

  const toggleSelection = (period: string) => setSelectedPeriod((current) => (current === period ? null : period))

  return (
    <ReliefCard ref={cardRef} className="flex w-full flex-col items-start justify-start p-5">
      <div className="flex w-full items-center justify-between">
        <div className="text-xl font-semibold">Protocol volumes</div>

        <div className="flex gap-3">
          {VOLUME_RANGE_TABS.map((tab) => (
            <ButtonTab
              key={tab.range}
              onClick={() => fetchVolumes(tab.range)}
              label={tab.label}
              active={selectedVolumeTab === tab.range}
              className="rounded-full !py-1"
            />
          ))}
        </div>
      </div>

      <Divider />

      <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center justify-start gap-1">
          <div className="text-subtitle">Total: </div>
          <div className="font-semibold text-white">{formatDollar(totalVolumes, 0)}</div>
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {VOLUME_CATEGORIES.map((category) => (
            <div key={category.key} className="flex items-center gap-1.5 text-subtitle">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
              {category.label}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full pr-12">
        <div ref={plotRef} className="relative h-64 w-full">
          {ticks.map((tick) => (
            <div key={tick} className="pointer-events-none absolute inset-x-0" style={{ bottom: `${(tick / axisMax) * 100}%` }}>
              <div className="h-px w-full bg-white/[0.06]" />
              <span className="absolute left-full top-1/2 w-12 -translate-y-1/2 whitespace-nowrap pl-1.5 text-[10px] text-subtitle sm:w-16 sm:pl-2 sm:text-xs">
                {formatYAxis(tick)}
              </span>
            </div>
          ))}

          <div className="absolute inset-0 flex items-end transition-opacity duration-200">
            {visibleVolumes.map((el) => {
              const segments = stackSegments(el, axisMax)
              const isSelected = !isDesktop && el?.period === selectedPeriod
              const isDimmed = !isDesktop && selectedPeriod !== null && !isSelected

              // Below `md` only: the bar becomes a toggle for the panel below
              const touchProps = isDesktop
                ? {}
                : {
                    role: "button",
                    tabIndex: 0,
                    "aria-pressed": isSelected,
                    "aria-label": `${el?.period} volume details`,
                    onClick: () => toggleSelection(el?.period),
                  }

              return (
                <InnerTooltip
                  key={el?.period}
                  innerContent={<div className="flex min-w-36 flex-col items-start justify-center gap-1 px-4">{el && <VolumeBreakdown volume={el} />}</div>}
                >
                  <div
                    {...touchProps}
                    className={cn(
                      "group flex h-full flex-1 cursor-pointer items-end justify-center outline-none transition-opacity duration-200",
                      isDimmed && "opacity-40"
                    )}
                  >
                    <div className={cn("relative h-full w-6 overflow-hidden rounded-md bg-white/[0.08]", isSelected && "ring-1 ring-white/40")}>
                      {/* Stack bottom-up, 1px of track between segments so adjacent colors never touch */}
                      <div className="absolute bottom-0 left-0 flex w-full flex-col-reverse gap-px transition-opacity duration-300 group-hover:opacity-80">
                        {segments
                          .filter((segment) => segment.px > 0)
                          .map((segment) => (
                            <div key={segment.key} className="w-full" style={{ height: `${segment.px}px`, backgroundColor: segment.color }} />
                          ))}
                      </div>
                    </div>
                  </div>
                </InnerTooltip>
              )
            })}
          </div>
        </div>

        <div className="mt-2 flex w-full">
          {visibleVolumes.map((el) => (
            <span key={el?.period} className="flex-1 text-center text-[10px] text-subtitle">
              {formatPeriodLabel(el?.period, selectedVolumeTab)}
            </span>
          ))}
        </div>

        {visibleVolumes.length < protocolVolumes.length && (
          <div className="mt-1 text-[10px] text-subtitle">
            Last {visibleVolumes.length} of {protocolVolumes.length} periods
          </div>
        )}
      </div>

      {!isDesktop && selectedVolume && (
        <div className="mt-4 flex w-full flex-col gap-1 rounded-[10px] bg-overlay-panel p-3 text-xs">
          <VolumeBreakdown volume={selectedVolume} />
        </div>
      )}
    </ReliefCard>
  )
}
