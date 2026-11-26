"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LargeButtonTab } from "@/components/design_system/inputs/large_button_tab"

const IS_LEVERAGE_ON = process.env.NEXT_PUBLIC_IS_LEVERAGE_ON === "true"

export type FeatureTabsV2Props = {
  feature: string
  activeTab: string
  canLeverage: boolean
  marketAddress: string
  isDepositPaused: boolean
  isBorrowPaused: boolean
  isLeveragePaused: boolean
  onClickBorrow: () => void
  onClickRepay: () => void
  onTabClick: (v: string) => void
  onTabClickLeverage: () => void
}

/**
 * V2 Borrow / Repay switch and its sub tabs. Same handlers as the live FeatureTabs (each tab is a route).
 * Two things make it feel instant: every sibling route is prefetched as soon as the card shows,
 * and the clicked tab is marked at once instead of waiting for the next page to arrive.
 */
export function FeatureTabsV2({
  feature,
  activeTab,
  canLeverage,
  marketAddress,
  isDepositPaused,
  isBorrowPaused,
  isLeveragePaused,
  onClickBorrow,
  onClickRepay,
  onTabClick,
  onTabClickLeverage,
}: FeatureTabsV2Props) {
  const router = useRouter()
  const borrowTabs = [
    { key: "deposit-borrow", label: "Deposit & borrow", go: () => onTabClick("deposit&borrow"), paused: isDepositPaused || isBorrowPaused, enabled: true },
    {
      key: "leverage",
      label: "Leverage",
      go: () => IS_LEVERAGE_ON && onTabClickLeverage(),
      paused: isLeveragePaused || isBorrowPaused || isDepositPaused,
      enabled: IS_LEVERAGE_ON && canLeverage,
    },
    { key: "deposit", label: "Deposit", go: () => onTabClick("deposit"), paused: isDepositPaused, enabled: true },
    { key: "borrow", label: "Borrow", go: () => onTabClick("borrow"), paused: isBorrowPaused, enabled: true },
  ]
  const repayTabs = [
    { key: "repay-withdraw", label: "Repay & withdraw", go: () => onTabClick("repay&withdraw"), paused: false, enabled: true },
    { key: "repay", label: "Repay", go: () => onTabClick("repay"), paused: false, enabled: true },
    { key: "withdraw", label: "Withdraw", go: () => onTabClick("withdraw"), paused: false, enabled: true },
    { key: "liquidate", label: "Liquidate", go: () => onTabClick("liquidate"), paused: false, enabled: true },
  ]

  // warm every sibling route so a switch does not wait for the network
  useEffect(() => {
    if (!marketAddress) return
    ;["deposit-borrow", "leverage", "deposit", "borrow", "repay-withdraw", "repay", "withdraw", "liquidate"].forEach((k) =>
      router.prefetch(`/${marketAddress}/${k}`)
    )
  }, [marketAddress, router])

  // optimistic selection: the clicked tab shows as active right away, until the route catches up
  const [pending, setPending] = useState<string | null>(null)
  useEffect(() => setPending(null), [feature])
  const shown = pending ?? feature

  // the side follows the page on screen (the route), so it stays right after back/forward, links or the mobile action bar
  const side = repayTabs.some((t) => t.key === shown) ? "Repay" : borrowTabs.some((t) => t.key === shown) ? "Borrow" : activeTab
  const tabs = side === "Borrow" ? borrowTabs : repayTabs

  // one underline that slides to the active tab, measured in the row (no shared layout animation, so no jump while
  // the row scrolls, the sheet moves or the route swaps the page)
  const rowRef = useRef<HTMLDivElement>(null)
  const [bar, setBar] = useState<{ x: number; w: number; animate: boolean } | null>(null)
  const lastSide = useRef(side)
  useLayoutEffect(() => {
    const row = rowRef.current
    const el = row?.querySelector<HTMLElement>(`[data-key="${shown}"]`)
    if (!row || !el) return setBar(null)
    // switching Borrow and Repay swaps the whole row: place the line without sliding across
    const animate = lastSide.current === side
    lastSide.current = side
    setBar({ x: el.offsetLeft, w: el.offsetWidth, animate })
    if (el.offsetLeft < row.scrollLeft || el.offsetLeft + el.offsetWidth > row.scrollLeft + row.clientWidth)
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" })
  }, [shown, side])

  // the row can change width without a tab change (a scrollbar appears in the form panel, the window resizes):
  // put the line back under the active tab, without sliding
  useEffect(() => {
    const row = rowRef.current
    if (!row || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => {
      const el = row.querySelector<HTMLElement>(`[data-key="${shown}"]`)
      if (el) setBar((b) => (b && b.x === el.offsetLeft && b.w === el.offsetWidth ? b : { x: el.offsetLeft, w: el.offsetWidth, animate: false }))
    })
    ro.observe(row)
    return () => ro.disconnect()
  }, [shown])

  return (
    <div className="flex w-full flex-col">
      <div role="tablist" className="flex w-full gap-1 rounded-[10px] bg-white/[0.04] p-1">
        <LargeButtonTab
          label="Borrow"
          active={side === "Borrow"}
          onClick={() => {
            if (side !== "Borrow") setPending("deposit-borrow")
            onClickBorrow()
          }}
        />
        <LargeButtonTab
          label="Repay"
          active={side === "Repay"}
          onClick={() => {
            if (side !== "Repay") setPending("repay-withdraw")
            onClickRepay()
          }}
        />
      </div>
      <div ref={rowRef} role="tablist" className="v2-chips relative mt-4 flex w-full justify-between gap-1 overflow-x-auto border-b border-hairline">
        {tabs.map((t) => {
          const active = shown === t.key
          return (
            <button
              key={t.key}
              data-key={t.key}
              role="tab"
              aria-selected={active}
              disabled={!t.enabled}
              onClick={() => {
                if (t.key === shown) return
                setPending(t.key)
                t.go()
              }}
              className={cn(
                "relative shrink-0 whitespace-nowrap px-1 pb-3 pt-2.5 text-[13px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 md:pb-2.5 md:pt-1",
                active ? "text-white" : "text-ink-3 hover:text-ink-2"
              )}
            >
              {t.label}
              {/* paused: a small amber dot (the bar icon pushed the four tabs past the panel width) */}
              {t.paused && (
                <span role="img" aria-label="Paused" title="Paused" className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-warning align-middle" />
              )}
            </button>
          )
        })}
        {bar && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-0 left-0 h-[3px] rounded-full bg-white md:h-0.5",
              bar.animate && "transition-[transform,width] duration-200 ease-out"
            )}
            style={{ width: Math.round(bar.w), transform: `translate3d(${Math.round(bar.x)}px, 0, 0)` }}
          />
        )}
      </div>
    </div>
  )
}
