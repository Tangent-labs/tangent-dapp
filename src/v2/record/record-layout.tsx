"use client"

import { Roll } from "@/v2/ui/roll"
import Link from "next/link"
import { ReactNode, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatMillions } from "@/lib/number_formatter"
import { useUSGRecordContext } from "@/components/products/usg/record/usg_record_context"
import { MarketDetails } from "@/components/products/usg/record/header/market_details"
import { MarketDetailsContracts } from "@/components/products/usg/record/header/components/market_details_contracts"
import { USGCollateralPrice } from "@/components/products/usg/record/collat_price/collat_price_content"
import { CollateralPriceProvider } from "@/components/products/usg/record/collat_price/collat_price_context"
import { USGPositionHistory } from "@/components/products/usg/record/position_history/usg_position_history"
import { VAPRCalculator } from "@/components/products/usg/record/vapr_calculator/vapr_calculator"
import { isFixedRateMarket } from "@/components/products/usg/list/usg_market_controller"
import { useUSGMaketListContext } from "@/components/products/usg/list/usg_market_list_context"
import { TERMS, Term } from "@/v2/ui/term"
import { Venue } from "@/v2/ui/venue"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { YourLoanV2 } from "./your-loan"
import { OracleV2 } from "./oracle"
import { MarketSwitcherV2 } from "./market-switcher"
import { MobileActionBar } from "@/v2/ui/mobile-action-bar"

/**
 * V2 market page. Same data and pieces as USGRecordLayout (record context, feature tabs, chart, calculator, contracts, history),
 * arranged as the V2: decision numbers first, the action card sticky on the right with "Your loan" above it.
 */
export function RecordLayoutV2({ featureTabs, children }: { featureTabs: ReactNode; children: ReactNode }) {
  const { collateralInfo, marketData, marketInfo, marketDisplayData, currentTotalMarketApr, computedBorrowRate, maxBorrowCapReached, marketContracts } =
    useUSGRecordContext()
  const [tab, setTab] = useState<"overview" | "activity">("overview")
  const name = collateralInfo?.symbol?.replaceAll("-", "/")
  const fixed = isFixedRateMarket(marketData?.constants?.irParams)
  const borrowed = parseFloat(String(marketDisplayData?.borrowed ?? "0").replace(/,/g, ""))
  const cap = parseFloat(String(marketDisplayData?.cap ?? "0").replace(/,/g, ""))
  const capRatio = cap > 0 ? Math.min(1, borrowed / cap) : 0
  // same "Max lev. vAPR" indicator as the live market list row
  const { displayRows } = useUSGMaketListContext()
  const listRow = displayRows?.find((row) => row.address?.toLowerCase() === marketInfo?.marketAddress?.toLowerCase())
  const maxLevIndicator = listRow?.indicators.find((i) => i.key === "maxvapr")
  const maxLevNum = Number(maxLevIndicator?.value)
  const maxLev = Number.isFinite(maxLevNum) && maxLevIndicator ? `${maxLevNum.toFixed(2)}%` : undefined
  const kind = fixed ? "FIR" : marketData?.constants?.irParams?.isHEC ? "HEC" : "LEC"
  // compact market bar once the page header scrolls under the top bar
  const headRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const el = headRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: "-72px 0px 0px 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  // phones and tablets: the action card sits under the page, so a bar keeps it one tap away until it is on screen
  const actionRef = useRef<HTMLDivElement>(null)

  return (
    <div className="w-full pb-24 pt-2 font-sans xl:pb-20">
      {/* header: breadcrumb, market switcher (same dialog as the live CollateralCard), one sentence */}
      <div className="text-[13px] text-ink-3">
        <Link href="/" className="hover:text-white">
          Markets
        </Link>{" "}
        / <span className="text-ink-2">{name}</span>
      </div>
      <div ref={headRef} className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <MarketSwitcherV2 address={marketInfo?.marketAddress} name={name} logoKey={collateralInfo?.logoKey} />
        {marketData && (
          <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
            {kind} market
            {marketData?.marketType && <span className="opacity-50">·</span>}
            <Venue type={marketData?.marketType ?? ""} />
          </span>
        )}
      </div>
      <p className="mt-2 text-[14px] text-ink-2">
        {maxBorrowCapReached
          ? `Borrow cap reached: ${formatMillions(marketDisplayData?.borrowed)} of ${formatMillions(marketDisplayData?.cap)} USG borrowed. Deposits stay open, and borrowing reopens as debt is repaid.`
          : `${formatMillions(marketDisplayData?.available)} USG left to borrow out of a ${formatMillions(marketDisplayData?.cap)} USG cap.`}
      </p>

      <div className="mt-10 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_392px]">
        <div className="min-w-0">
          <div className="sticky top-16 z-30 h-0 lg:top-[72px]">
            <AnimatePresence>
              {stuck && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: [0.25, 0.8, 0.25, 1] }}
                  className="flex items-center gap-x-6 gap-y-1 overflow-x-auto border-b border-hairline bg-page py-2.5"
                >
                  <span className="flex shrink-0 items-center gap-2.5">
                    <TokenImage token={collateralInfo?.logoKey} size={24} className="h-6 w-auto" />
                    <span className="text-[15px] font-semibold">{name}</span>
                  </span>
                  <Mini label="Collateral vAPR" value={`${currentTotalMarketApr?.toFixed(2)}%`} />
                  <Mini label="Max lev. vAPR" value={maxLev} negative={maxLevNum < 0} />
                  <Mini label="Borrow rate" value={computedBorrowRate.current} />
                  <Mini label="Capacity" value={maxBorrowCapReached ? "Cap reached" : `${Math.round(capRatio * 100)}%`} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div role="tablist" className="mb-6 flex gap-6 border-b border-hairline">
            {(["overview", "activity"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn("relative pb-3 text-[14px] font-medium capitalize transition-colors", tab === t ? "text-white" : "text-ink-3 hover:text-ink-2")}
              >
                {t}
                {tab === t && (
                  <motion.span
                    layoutId="v2-detail-tab"
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-white"
                    transition={{ type: "spring", visualDuration: 0.35, bounce: 0.15 }}
                  />
                )}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {tab === "activity" ? (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <USGPositionHistory />
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                className="space-y-10"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {/* stat strip: the decision metric first and biggest */}
                <div className="v2-kpis flex items-stretch">
                  <Stat label="Collateral vAPR" info={TERMS.vapr} value={`${currentTotalMarketApr?.toFixed(2)}%`} hero />
                  <Stat
                    label="Max lev. vAPR"
                    info={TERMS.maxLevVapr}
                    value={maxLev ?? "-"}
                    sub={(() => {
                      const proj = Number(maxLevIndicator?.subValue)
                      return Number.isFinite(proj) ? `Proj. ${proj.toFixed(2)}%` : undefined
                    })()}
                    negative={maxLevNum < 0}
                  />
                  <Stat
                    label="Borrow rate"
                    info={TERMS.borrowRate}
                    value={computedBorrowRate.current}
                    sub={fixed ? "Fixed" : `Proj. ${computedBorrowRate.next}`}
                  />
                  <Stat
                    label="Rewards cut"
                    info={TERMS.rewardsCut}
                    value={marketDisplayData.rewardsCutCurrent}
                    sub={`Proj. ${marketDisplayData.rewardsCutNext}`}
                  />
                  <Stat
                    label="Capacity"
                    value={maxBorrowCapReached ? "Cap reached" : `${Math.round(capRatio * 100)}%`}
                    sub={`${formatMillions(marketDisplayData?.borrowed)} / ${formatMillions(marketDisplayData?.cap)}`}
                    warn={maxBorrowCapReached}
                  />
                </div>

                {/* the live chart card carries its own title and range tabs */}
                <CollateralPriceProvider>
                  <USGCollateralPrice />
                  <div className="mt-10">
                    <Section title="Oracle" note="The price feed this market uses to value the collateral.">
                      <OracleV2 />
                    </Section>
                  </div>
                </CollateralPriceProvider>

                <Section
                  title="Borrowing"
                  note={`Borrow rate and rewards cut both depend on the USG price.${maxBorrowCapReached ? " Borrowing is paused while the cap is reached." : ""}`}
                >
                  <div className="grid grid-cols-2 divide-divider border-y border-hairline py-4 md:grid-cols-4 md:divide-x [&>*:first-child]:pl-0">
                    {[
                      ["TVL", `$${formatMillions(marketDisplayData?.tvlDollar)}`, "Collateral deposited"],
                      ["Available", `${formatMillions(marketDisplayData?.available)} USG`, "Left to borrow"],
                      ["Max LTV", marketDisplayData.maxLtv, "Max borrow vs collateral", TERMS.maxLtv],
                      ["Liquidation threshold", marketDisplayData.lt, "Health 1.00 below this", TERMS.lt],
                    ].map(([l, v, s, info]) => (
                      <div key={l} className="px-4">
                        <div className="text-xs text-ink-3">{info ? <Term info={info}>{l}</Term> : l}</div>
                        <div className="mt-1 text-[16px] font-medium tabular-nums">{v}</div>
                        <div className="mt-0.5 text-xs text-ink-3">{s}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <VAPRCalculator />
                  </div>
                </Section>

                <Section title="Market" note="Rate model, borrow history, platform and contracts. Every transaction is under Activity.">
                  <div className="space-y-4">
                    <MarketDetails />
                    <MarketDetailsContracts marketContracts={marketContracts} />
                  </div>
                </Section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* right column: Your loan scrolls away, the action card stays under the top bar */}
        <div className="flex flex-col gap-4 self-stretch">
          <YourLoanV2 />
          <div ref={actionRef} id="v2-action" className="scroll-mt-20 rounded-2xl border border-hairline bg-surface p-4 sm:p-5 xl:sticky xl:top-24">
            {featureTabs}
            <div className="mt-4 flex flex-col gap-3">{children}</div>
          </div>
        </div>
      </div>

      <MobileActionBar
        target={actionRef}
        title={name}
        sub={`vAPR ${currentTotalMarketApr?.toFixed(2)}% · borrow ${computedBorrowRate.current}`}
        label="Deposit & borrow"
      />
    </div>
  )
}

function Mini({ label, value, negative }: { label: string; value?: string; negative?: boolean }) {
  return (
    <span className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap text-[13px]">
      <span className="text-ink-3">{label}</span>
      <Roll className={cn("font-medium", negative && "text-negative")} value={value ?? "-"} />
    </span>
  )
}

function Stat({
  label,
  value,
  sub,
  hero,
  warn,
  info,
  negative,
}: {
  label: string
  value: string
  sub?: string
  hero?: boolean
  warn?: boolean
  info?: string
  negative?: boolean
}) {
  return (
    <div className={hero ? "min-w-0 flex-[1.6] pr-8" : "min-w-0 flex-1 border-l border-divider px-6"}>
      <div className="text-xs text-ink-3">{info ? <Term info={info}>{label}</Term> : label}</div>
      <div
        className={cn(
          "mt-1 whitespace-nowrap tabular-nums tracking-[-0.02em]",
          hero ? "text-[48px] font-light leading-[1.05]" : warn ? "text-[20px] font-medium leading-[30px]" : "text-[24px] font-medium",
          warn && "text-warning",
          negative && "text-negative"
        )}
      >
        <Roll value={value} />
      </div>
      {sub && <div className="mt-1.5 text-xs tabular-nums text-ink-2">{sub}</div>}
    </div>
  )
}

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[20px] font-semibold tracking-[-0.01em]">{title}</h2>
      <p className="mb-4 mt-1 text-[13px] text-ink-2">{note}</p>
      {children}
    </section>
  )
}
