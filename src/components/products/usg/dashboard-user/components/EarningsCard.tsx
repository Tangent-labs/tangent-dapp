"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { motion, useReducedMotion } from "framer-motion"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { Title } from "@/components/design_system/structure/title"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { Separator } from "./Separator"
import { RollingNumber } from "./RollingNumber"
import { EARNING_PERIODS, PERIOD_MULTIPLIER, getSharePercent } from "../dashboard_user_controller"
import type { EarningLine, EarningPeriod } from "../dashboard_user_type"

type EarningsCardProps = {
  lines: EarningLine[]
}

// Placeholder bars shown when there is nothing to display yet
const EMPTY_BARS = [0, 1, 2]

const AXIS_TICKS = ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"]

type EarningBarProps = {
  index: number
  line: EarningLine
  amount: number
  share: number
  multiplier: number
}

// Space kept between the cursor and the tooltip
const TOOLTIP_OFFSET = 14

type Pointer = { x: number; y: number }

// Share details shown next to the cursor while hovering a bar
const ShareDetails = ({ line, amount, share, multiplier, pointer }: Omit<EarningBarProps, "index"> & { pointer: Pointer }) => {
  const ref = useRef<HTMLDivElement>(null)

  // Flip to the other side of the cursor when the tooltip would leave the screen
  const width = ref.current?.offsetWidth ?? 160
  const height = ref.current?.offsetHeight ?? 150
  const x = pointer.x + TOOLTIP_OFFSET + width > window.innerWidth - 8 ? pointer.x - width - TOOLTIP_OFFSET : pointer.x + TOOLTIP_OFFSET
  const y = pointer.y + TOOLTIP_OFFSET + height > window.innerHeight - 8 ? pointer.y - height - TOOLTIP_OFFSET : pointer.y + TOOLTIP_OFFSET

  return createPortal(
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-[1001] w-[160px]" style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}>
      <ReliefCard className="bg-[#0c0c0c]/90 text-[10px] text-white">
        <div className="flex flex-col gap-[5px] p-2.5">
          <div className="flex justify-between">
            <span className="text-subtitle">Share details</span>
            <span>{Math.round(share)}%</span>
          </div>

          <Separator />

          {line.details?.map((detail, index) => (
            <div key={`${detail.token}-${index}`} className="flex items-center gap-[5px]">
              <TokenImage token={detail.token} size={16} className="size-[15px] rounded-full" />
              <span>
                {formatNumber(detail.amount * multiplier, 0)} {detail.token} <span className="text-subtitle">({formatDollar(detail.usd * multiplier, 0)})</span>
              </span>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatDollar(amount)}</span>
          </div>
        </div>
      </ReliefCard>
    </div>,
    document.body
  )
}

const EarningBar = ({ index, line, amount, share, multiplier }: EarningBarProps) => {
  const [pointer, setPointer] = useState<Pointer | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const hasDetails = !!line.details?.length

  // The tooltip follows the cursor, and closes when the page scrolls
  useEffect(() => {
    if (!pointer) return
    const close = () => setPointer(null)
    window.addEventListener("scroll", close, { passive: true })
    return () => window.removeEventListener("scroll", close)
  }, [pointer])

  const onMouse = (e: React.PointerEvent) => {
    if (hasDetails && e.pointerType !== "touch") setPointer({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        className="flex w-full cursor-pointer flex-col gap-[5px]"
        onPointerEnter={onMouse}
        onPointerMove={onMouse}
        onPointerLeave={(e) => e.pointerType !== "touch" && setPointer(null)}
        // Touch devices have no hover: toggle the details on tap
        onPointerDown={(e) => hasDetails && e.pointerType === "touch" && setPointer((prev) => (prev ? null : { x: e.clientX, y: e.clientY }))}
      >
        <div className="flex w-full items-start justify-between text-xs">
          <span className="text-subtitle">{line.label}</span>
          <span className="font-semibold">{formatDollar(amount)}</span>
        </div>

        <div className="relative flex h-1.5 w-full items-center bg-overlay-panel">
          <motion.div
            className="absolute left-0 h-2.5 rounded-r-[10px] bg-button-active"
            initial={{ width: shouldReduceMotion ? `${share}%` : 0 }}
            animate={{ width: `${share}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: shouldReduceMotion ? 0 : index * 0.08 }}
          />
        </div>
      </div>

      {pointer && <ShareDetails line={line} amount={amount} share={share} multiplier={multiplier} pointer={pointer} />}
    </>
  )
}

export const EarningsCard = ({ lines }: EarningsCardProps) => {
  const [period, setPeriod] = useState<EarningPeriod>("current")

  const multiplier = PERIOD_MULTIPLIER[period]
  const total = lines.reduce((sum, line) => sum + line.amount, 0) * multiplier

  return (
    <ReliefCard className="flex w-full flex-col justify-between gap-2.5 p-5 xl:min-w-0 xl:flex-1">
      <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-start xl:gap-6">
        <Title label="Earnings" size="normal" />

        <div role="tablist" className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
          {EARNING_PERIODS.map((p) => (
            <ButtonTab key={p.key} label={p.label} active={period === p.key} onClick={() => setPeriod(p.key)} className="h-[30px] !px-1.5" />
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex w-full flex-col gap-2.5">
        {lines.length === 0 &&
          EMPTY_BARS.map((key) => (
            // Same height as a real bar (label + track) so the card does not change size
            <div key={key} className="flex h-[26px] items-end" aria-hidden>
              <div className="h-1.5 w-full bg-overlay-panel" />
            </div>
          ))}

        {lines.map((line, index) => {
          const amount = line.amount * multiplier
          return <EarningBar key={line.key} index={index} line={line} amount={amount} share={getSharePercent(amount, total)} multiplier={multiplier} />
        })}
      </div>

      <div className="flex w-full justify-between text-[10px] text-subtitle">
        {AXIS_TICKS.map((tick) => (
          <span key={tick} className="hidden first:block last:block sm:block">
            {tick}
          </span>
        ))}
      </div>

      <Separator />

      <div className="flex w-full items-center justify-between text-xl font-semibold">
        <span>Total</span>
        <span>
          <RollingNumber value={total} format={(v) => formatDollar(v)} />
        </span>
      </div>
    </ReliefCard>
  )
}
