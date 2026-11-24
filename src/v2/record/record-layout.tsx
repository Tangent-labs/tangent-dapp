"use client"

import { Roll } from "@/v2/ui/roll"
import Link from "next/link"
import { ReactNode, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { TriangleAlert } from "lucide-react"
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
import { MarketSwitcherV2 } from "./market-switcher"
import { ActionSheet, MobileActionBar, useIsDesktop } from "@/v2/ui/mobile-action-bar"
import { useRouter } from "next/navigation"

/**
 * V2 market page. Same data and pieces as USGRecordLayout (record context, feature tabs, chart, calculator, contracts, history),
 * arranged as the V2: decision numbers first, the action card sticky on the right with "Your loan" above it.
 */
export function RecordLayoutV2({ featureTabs, children }: { featureTabs: ReactNode; children: ReactNode }) {
  const {
    collateralInfo,
    marketData,
    marketInfo,
    marketDisplayData,
    currentTotalMarketApr,
    computedBorrowRate,
    maxBorrowCapReached,
    marketContracts,
    setActiveTab,
  } = useUSGRecordContext()
  const [tab, setTab] = useState<"overview" | "activity">("overview")
  const name = collateralInfo?.symbol?.replaceAll("-", "/")
  const fixed = isFixedRateMarket(marketData?.constants?.irParams)
  const borrowed = parseFloat(String(marketDisplayData?.borrowed ?? "0").replace(/,/g, ""))
  const cap = parseFloat(String(marketDisplayData?.cap ?? "0").replace(/,/g, ""))
  const capRatio = cap > 0 ? Math.min(1, borrowed / cap) : 0
  // until the market data arrives the context reports zeros: show skeletons, never "0 USG cap"
  const loading = !marketData || !(cap > 0)
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
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), {
      rootMargin: window.matchMedia("(min-width: 1024px)").matches ? "0px" : "-64px 0px 0px 0px",
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const isDesktop = useIsDesktop()
  const router = useRouter()
  const [sheet, setSheet] = useState(false)
  const hasDebt = (marketData?.debtInfos?.userDebt ?? 0n) > 0n
  // the Borrow / Repay side follows the route, like the live feature tabs
  const openSheet = (route: "deposit-borrow" | "borrow" | "repay-withdraw") => {
    const onRepay = ["repay", "withdraw", "repay-withdraw", "liquidate"].includes(window.location.pathname.split("/").pop() ?? "")
    const current = window.location.pathname.split("/").pop()
    // keep the sub tab the user is on when it already matches the side; "borrow" always lands on the Borrow tab
    const go = route === "borrow" ? current !== "borrow" : (route === "repay-withdraw") !== onRepay
    if (go) router.replace(`/${marketInfo?.marketAddress}/${route}`, { scroll: false })
    setActiveTab(route === "repay-withdraw" ? "Repay" : "Borrow")
    setSheet(true)
  }
  const form = (
    <>
      {featureTabs}
      <RiskNotice />
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </>
  )

  return (
    <div className="w-full pb-24 pt-2 font-sans xl:pb-20">
      {/* header: breadcrumb, market switcher (same dialog as the live CollateralCard), one sentence */}
      <div className="xl:flex xl:items-end xl:justify-between xl:gap-10">
        <div className="min-w-0">
          <div className="text-[13px] text-ink-3">
            <Link href="/" className="hover:text-white">
              Markets
            </Link>{" "}
            / <span className="text-ink-2">{name}</span>
          </div>
          <div ref={headRef} className="mt-2 flex flex-col items-start gap-1.5">
            <MarketSwitcherV2 address={marketInfo?.marketAddress} name={name} logoKey={collateralInfo?.logoKey} />
            {marketData && (
              <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
                {kind} market
                {marketData?.marketType && <span className="opacity-50">·</span>}
                <Venue type={marketData?.marketType ?? ""} />
              </span>
            )}
          </div>
          <p className={cn("mt-2 text-[14px] text-ink-2", loading && "v2-shimmer h-5 w-72 max-w-full rounded-md text-transparent")}>
            {maxBorrowCapReached
              ? `Borrow cap reached: ${formatMillions(marketDisplayData?.borrowed)} of ${formatMillions(marketDisplayData?.cap)} USG borrowed. Deposits stay open, and borrowing reopens as debt is repaid.`
              : `${formatMillions(marketDisplayData?.available)} USG left to borrow out of a ${formatMillions(marketDisplayData?.cap)} USG cap.`}
          </p>
        </div>

        {/* market facts next to the title (they used to sit in a Borrowing block under the chart) */}
        <div className="mt-6 grid grid-cols-2 gap-y-4 md:flex md:gap-y-0 xl:mt-0 xl:shrink-0">
          {(
            [
              ["TVL", "$" + formatMillions(marketDisplayData?.tvlDollar), "Collateral deposited", undefined],
              [
                "Capacity",
                maxBorrowCapReached ? "Cap reached" : Math.round(capRatio * 100) + "%",
                formatMillions(marketDisplayData?.borrowed) + " / " + formatMillions(marketDisplayData?.cap),
                undefined,
              ],
              ["Max LTV", marketDisplayData.maxLtv, "Borrow limit", TERMS.maxLtv],
              ["Liq. threshold", marketDisplayData.lt, "Liquidation point", TERMS.lt],
            ] as [string, string, string, string | undefined][]
          ).map(([l, v, s, info]) => (
            // fixed width per fact (md up) so the block does not slide left when the numbers arrive
            <div
              key={l}
              className="min-w-0 pr-4 md:box-content md:w-[124px] md:shrink-0 md:border-l md:border-divider md:px-6 md:first:border-l-0 md:first:pl-0 md:last:pr-0 2xl:px-10"
            >
              <div className="whitespace-nowrap text-xs text-ink-3">{info ? <Term info={info}>{l}</Term> : l}</div>
              {loading ? (
                <div className="v2-shimmer mt-1.5 h-5 w-16 rounded-md" />
              ) : (
                <div
                  className={cn("mt-1 truncate text-[16px] font-medium tabular-nums xl:text-[18px]", l === "Capacity" && maxBorrowCapReached && "text-warning")}
                >
                  {v}
                </div>
              )}
              <div className="mt-0.5 truncate text-xs tabular-nums text-ink-3">{loading ? " " : s}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_392px]">
        <div className="min-w-0">
          <div className="sticky top-16 z-30 h-0 lg:top-0">
            <AnimatePresence>
              {stuck && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: [0.25, 0.8, 0.25, 1] }}
                  className="v2-chips flex items-center gap-x-4 gap-y-1 overflow-x-auto border-b border-hairline bg-page py-2.5 md:gap-x-6"
                >
                  <span className="flex shrink-0 items-center gap-2.5">
                    <TokenImage token={collateralInfo?.logoKey} size={24} className="h-6 w-auto" />
                    <span className="max-w-[120px] truncate text-[15px] font-semibold sm:max-w-none">{name}</span>
                  </span>
                  {/* phones keep the two numbers that decide a borrow, with short labels; the rest from md up */}
                  <Mini label="Collateral vAPR" short="vAPR" value={`${currentTotalMarketApr?.toFixed(2)}%`} />
                  <Mini label="Max lev. vAPR" value={maxLev} className="hidden md:flex" />
                  <Mini label="Borrow rate" short="Borrow" value={computedBorrowRate.current} />
                  <Mini label="Capacity" value={maxBorrowCapReached ? "Cap reached" : `${Math.round(capRatio * 100)}%`} className="hidden md:flex" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* phones and tablets: your position comes before the market details, not after them */}
          <div className="mb-8 empty:hidden xl:hidden">
            <YourLoanV2 />
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
                {tab === t && <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-white md:h-0.5" />}
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
                {/* stat strip: what decides a borrow, the yield first and biggest */}
                <div className="v2-kpis flex items-stretch">
                  <Stat loading={loading} label="Collateral vAPR" info={TERMS.vapr} value={`${currentTotalMarketApr?.toFixed(2)}%`} hero />
                  <Stat
                    loading={loading}
                    label="Borrow rate"
                    info={TERMS.borrowRate}
                    value={computedBorrowRate.current}
                    sub={fixed ? "Fixed" : `Proj. ${computedBorrowRate.next}`}
                  />
                  <Stat
                    loading={loading}
                    label="Max lev. vAPR"
                    info={TERMS.maxLevVapr}
                    value={maxLev ?? "-"}
                    sub={(() => {
                      const proj = Number(maxLevIndicator?.subValue)
                      return Number.isFinite(proj) ? "Proj. " + proj.toFixed(2) + "%" : "No projection"
                    })()}
                  />
                  <Stat
                    loading={loading}
                    label="Rewards cut"
                    info={TERMS.rewardsCut}
                    value={marketDisplayData.rewardsCutCurrent}
                    sub={"Proj. " + marketDisplayData.rewardsCutNext}
                  />
                </div>

                {/* the live chart card carries its own title and range tabs */}
                <CollateralPriceProvider>
                  <USGCollateralPrice />

                  <div className="mt-10 space-y-10">
                    <VAPRCalculator />

                    <Section title="Market" note="Rate model, borrow history, platform and contracts. Every transaction is under Activity.">
                      <div className="space-y-4">
                        <MarketDetails />
                        <MarketDetailsContracts marketContracts={marketContracts} />
                      </div>
                    </Section>
                  </div>
                </CollateralPriceProvider>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* right column: the form first (no scroll to reach it on short screens), Your loan right under it in the same sticky card,
            like the phone sheet; the card scrolls inside itself when it is taller than the window */}
        <div className="hidden flex-col self-stretch xl:flex">
          {isDesktop && (
            <div id="v2-action" className="v2-scroll sticky top-6 max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-2xl border border-hairline bg-surface p-5">
              {form}
              <div className="mt-4 empty:hidden">
                <YourLoanV2 />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* phones and tablets: the form opens in a bottom sheet from the action bar, like a mobile app */}
      {!isDesktop && (
        <>
          <MobileActionBar
            title={name}
            sub={loading ? undefined : `vAPR ${currentTotalMarketApr?.toFixed(2)}% · borrow ${computedBorrowRate.current}`}
            actions={[
              ...(hasDebt ? [{ label: "Repay", onClick: () => openSheet("repay-withdraw") }] : []),
              { label: hasDebt ? "Borrow" : "Deposit & borrow", primary: true, onClick: () => openSheet(hasDebt ? "borrow" : "deposit-borrow") },
            ]}
          />
          <ActionSheet open={sheet} onClose={() => setSheet(false)} title={name}>
            {form}
            <div className="mt-4 empty:hidden">
              <YourLoanV2 />
            </div>
          </ActionSheet>
        </>
      )}
    </div>
  )
}

function Mini({ label, short, value, negative, className }: { label: string; short?: string; value?: string; negative?: boolean; className?: string }) {
  return (
    <span className={cn("flex shrink-0 items-baseline gap-1.5 whitespace-nowrap text-[13px]", className)}>
      {short ? (
        <>
          <span className="text-ink-3 md:hidden">{short}</span>
          <span className="hidden text-ink-3 md:inline">{label}</span>
        </>
      ) : (
        <span className="text-ink-3">{label}</span>
      )}
      <Roll className={cn("font-medium", negative && "text-negative")} value={value ?? "-"} />
    </span>
  )
}

function Stat({
  loading,
  label,
  value,
  sub,
  hero,
  warn,
  info,
  negative,
}: {
  loading?: boolean
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
        {loading ? <span className={cn("v2-shimmer inline-block rounded-md align-middle", hero ? "h-11 w-32" : "h-6 w-20")} /> : <Roll value={value} />}
      </div>
      {sub && (loading ? <div className="v2-shimmer mt-2 h-3 w-16 rounded" /> : <div className="mt-1.5 text-xs tabular-nums text-ink-2">{sub}</div>)}
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

/**
 * Shown in the action card while the user types an amount that leaves the position close to liquidation.
 * Reads only what the record context already computes (futureMarketDisplayData, liquidationPrice); it does not block the action.
 */
function RiskNotice() {
  const { futureMarketDisplayData, marketData, currentAmounts, liquidationPrice } = useUSGRecordContext()
  const typing = Object.values(currentAmounts ?? {}).some((v) => !!v && v > 0n)
  const after = parseFloat(String(futureMarketDisplayData.health).replace(/,/g, ""))
  const debtAfter = parseFloat(String(futureMarketDisplayData.debt).replace(/,/g, ""))
  const show = typing && debtAfter > 0 && Number.isFinite(after) && after > 0 && after < 1.05
  if (!show || !marketData) return null
  const liq = Number(Number(liquidationPrice / 10n ** 15n).toFixed(4)) / 1000
  return (
    <div role="status" className="mt-4 flex gap-2.5 rounded-[10px] border border-hairline bg-white/[0.04] p-3 text-[13px] leading-snug">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={2} />
      <span className="text-ink-2">
        <span className="font-medium text-white">Health {futureMarketDisplayData.health} after this action.</span> The position could be liquidated if the
        collateral price falls{liq > 0 ? ` to $${liq.toFixed(4)}` : ""}. Borrow less or add collateral to stay safer.
      </span>
    </div>
  )
}
