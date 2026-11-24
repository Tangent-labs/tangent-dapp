"use client"

import { Roll } from "@/v2/ui/roll"
import { VoidTexture } from "@/v2/ui/void-texture"
import Link from "next/link"
import { ReactNode, useMemo, useState } from "react"
import { formatUnits } from "viem"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronRight, HeartPulse, LayoutGrid, List, Pause, Search, SlidersHorizontal, TriangleAlert, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { ListRowData } from "@/types"
import { formatMillions } from "@/lib/number_formatter"
import { useRootContext } from "@/components/products/root/root_context"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { useUSGMaketListContext } from "@/components/products/usg/list/usg_market_list_context"
import { marketOptions, protocolOptions } from "@/components/products/usg/list/usg_market_controller"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { AprMark } from "@/v2/ui/apr-mark"
import { Term } from "@/v2/ui/term"
import { Venue } from "@/v2/ui/venue"
import { SelectMenu } from "@/v2/ui/select-menu"
import { Sparkline } from "@/v2/ui/sparkline"
import { StatusChip } from "@/v2/ui/status-chip"
import { HoverInfo } from "@/v2/ui/info-sheet"
import { HEALTH_AT_RISK, PositionHealth, usePositionHealth } from "./positions"
import { ActionSheet } from "@/v2/ui/mobile-action-bar"

/** Market kinds as the docs define them (docs.tangent.finance, markets overview). */
const KINDS: Record<string, { title: string; rule: string }> = {
  HEC: { title: "High emissions collateral", rule: "rewards cut up to 90%, then interest under the market threshold" },
  LEC: { title: "Low emissions collateral", rule: "dynamic interest from day one, rewards cut 2.5%" },
  FIR: { title: "Fixed interest rate", rule: "rewards cut 10%" },
}
const kindOf = (r: ListRowData) => (r.isFixedRate ? "FIR" : r.type)
const ind = (r: ListRowData, key: string) => r.indicators.find((i) => i.key === key)
const pct = (n?: number) => (n === undefined || Number.isNaN(n) ? "-" : `${n.toFixed(2)}%`)

/** Sort keys are the ones the live getSortedRows understands. */
const SORTS = [
  { value: "default", label: "Your positions, then TVL" },
  { value: "tvl", label: "TVL" },
  { value: "vapr", label: "vAPR" },
  { value: "maxvapr", label: "Max lev. vAPR" },
  { value: "borrowRate", label: "Borrow rate", asc: true },
  { value: "borrowed", label: "Borrowed" },
  { value: "collateral", label: "Collateral", asc: true },
]
const SHOW = [
  { value: "all", label: "All markets" },
  { value: "deposits", label: "Your deposits" },
  { value: "deprecated", label: "Deprecated" },
]

export function MarketListV2() {
  const {
    displayRows,
    globalData,
    searchValue,
    setSearchValue,
    userData,
    getSortedRows,
    marketType,
    setMarketType,
    protocol,
    setProtocol,
    filteredBy,
    setFilteredBy,
  } = useUSGMaketListContext()
  const { sUSGCurrentAPY, priceHistory } = useRootContext()
  const { lpUserPoints, voteUserPoints } = useUSGContext()
  // same keys and directions as the live list headers (getSortedRows)
  const [sort, setSortState] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "default", dir: "desc" })
  const defaultDir = (key: string) => (SORTS.find((x) => x.value === key)?.asc ? "asc" : "desc")
  const setSort = (key: string) => setSortState({ key, dir: defaultDir(key) })
  const toggleSort = (key: string) => setSortState((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: defaultDir(key) }))
  const [view, setView] = useState<"list" | "cards">("list")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilters = (marketType !== "All" ? 1 : 0) + (protocol !== "All" ? 1 : 0) + (sort.key !== "default" ? 1 : 0)

  const loading = globalData.USGPrice === "-"
  const sorted = useMemo(() => {
    return getSortedRows(displayRows, { search: undefined, sort: { key: sort.key, direction: sort.dir } })
  }, [displayRows, sort, getSortedRows])

  const groups = (["HEC", "LEC", "FIR"] as const).map((k) => ({ k, rows: sorted.filter((r) => kindOf(r) === k) })).filter((g) => g.rows.length)
  const grouped = sort.key === "default"

  const userDebt = Number(formatUnits(userData?.totalUserDebt || 0n, 18))
  const userDeposit = Number(formatUnits(userData?.totalUserDeposit || 0n, 18))
  const points = (lpUserPoints?.lpTotalPoints || 0) + (voteUserPoints?.voteTotalPoints || 0)

  const healthByMarket = usePositionHealth()
  const atRisk = sorted
    .map((r) => ({ r, pos: healthByMarket.get(r.address.toLowerCase()) }))
    .filter((x): x is { r: ListRowData; pos: PositionHealth } => !!x.pos && x.pos.health < HEALTH_AT_RISK)
    .sort((a, b) => a.pos.health - b.pos.health)
  const lowest = [...healthByMarket.values()].sort((a, b) => a.health - b.health)[0]

  const typeOptions = marketOptions.map((o) => ({ ...o, label: o.value === "All" ? "All types" : o.label, hint: KINDS[o.value]?.title }))
  const protocolOpts = protocolOptions.map((o) => ({ ...o, label: o.value === "All" ? "All protocols" : o.label }))

  return (
    <div className="font-sans">
      <div className="xl:flex xl:items-start xl:justify-between xl:gap-10">
        <div className="min-w-0">
          <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Markets</h1>
          <p className="mt-1 text-[14px] text-ink-2">
            Borrow USG against productive collateral.
            {!loading &&
              ` Markets hold $${formatMillions(globalData.globalTvl)} of collateral against ${formatMillions(globalData.globalDebt)} USG of debt.`}{" "}
            <Link
              href="https://docs.tangent.finance/docs/usg/overview_usg#markets%E2%80%8B"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-white/25 underline-offset-4 hover:decoration-white"
            >
              HEC, LEC and FIR explained
            </Link>
          </p>
        </div>
        {atRisk.length > 0 && <RiskAlert atRisk={atRisk} className="hidden w-[460px] shrink-0 xl:flex" />}
      </div>

      {/* phones: one compact card (price vs peg with the month line, then the four protocol numbers on one row) */}
      <div className="mt-6 rounded-2xl border border-hairline bg-surface p-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-ink-2">USG price</div>
            <div className={cn("mt-0.5 text-[26px] font-light tabular-nums leading-8 tracking-[-0.02em]", loading && "animate-pulse text-ink-3")}>
              <Roll value={loading ? "$-" : "$" + globalData.USGPrice} />
            </div>
            {!loading && (
              <div className="text-[12px] tabular-nums text-ink-3">
                {(() => {
                  const gap = (Number(globalData.USGPrice) - 1) * 100
                  return `${gap >= 0 ? "+" : "−"}${Math.abs(gap).toFixed(2)}% vs $1.00 peg`
                })()}
              </div>
            )}
          </div>
          <div className="w-28 shrink-0">
            <Sparkline values={(priceHistory?.USG ?? []).map((p) => p.uv)} height={40} reference={1} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-divider pt-3">
          {[
            ["TVL", loading ? "-" : `$${formatMillions(globalData.globalTvl)}`],
            ["Debt", loading ? "-" : formatMillions(globalData.globalDebt)],
            ["Coll. ratio", globalData.globalCr],
            ["sUSG APY", sUSGCurrentAPY ? `${sUSGCurrentAPY.toFixed(2)}%` : "-"],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <div className="truncate text-[11px] text-ink-3">{label}</div>
              <div className={cn("truncate text-[14px] font-medium tabular-nums", value === "-" && "animate-pulse text-ink-3")}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* tablet and desktop: the peg first, then the four protocol numbers */}
      <div className="mt-10 hidden grid-cols-1 gap-4 md:grid xl:grid-cols-2">
        <div className="relative isolate flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface p-6">
          <span aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <VoidTexture id="peg-hero" />
          </span>
          <span className="text-[13px] font-medium text-ink-2">USG price</span>
          <span className={cn("mt-1 text-[44px] font-light tabular-nums leading-none tracking-[-0.03em]", loading && "animate-pulse text-ink-3")}>
            <Roll value={loading ? "$-" : "$" + globalData.USGPrice} />
          </span>
          {!loading && (
            <p className="mt-3 text-[13px] text-ink-2">
              {(() => {
                const under = (1 - Number(globalData.USGPrice)) * 100
                return under > 0 ? `${under.toFixed(2)}% under the $1.00 peg.` : `${(-under).toFixed(2)}% above the $1.00 peg.`
              })()}{" "}
              USG supply {globalData.USGSupply}.
            </p>
          )}
          <div className="mt-auto pt-5">
            <div className="mb-1 flex justify-between text-[11px] text-ink-3">
              <span>Last month</span>
              <span>Peg $1.00</span>
            </div>
            <Sparkline values={(priceHistory?.USG ?? []).map((p) => p.uv)} height={56} reference={1} />
          </div>
        </div>
        <div className="grid grid-cols-2 border-y border-hairline xl:border-y-0">
          <Tile label="Markets TVL" value={loading ? "-" : `$${formatMillions(globalData.globalTvl)}`} foot="Collateral deposited in all markets" />
          <Tile label="Total debt" value={loading ? "-" : `${formatMillions(globalData.globalDebt)} USG`} foot="USG borrowed across markets" />
          <Tile label="Collateral ratio" value={globalData.globalCr} foot="Markets TVL over total debt" />
          <Tile
            label="sUSG APY"
            value={sUSGCurrentAPY ? `${sUSGCurrentAPY.toFixed(2)}%` : "-"}
            foot={`sUSG ${globalData.sUSGPrice}, supply ${globalData.sUSGSupply}`}
          />
        </div>
      </div>

      {/* positions one price move from liquidation (wide screens show it next to the title) */}
      {atRisk.length > 0 && <RiskAlert atRisk={atRisk} className="mt-6 xl:hidden" />}

      {/* your numbers, only when the wallet has a position (points alone do not show the row) */}
      {(userDeposit > 0 || userDebt > 0) && (
        <div className="mt-6 border-t border-hairline pt-5 text-[13px] md:flex md:flex-wrap md:items-center md:gap-x-8 md:gap-y-2">
          {/* phones: a titled row of three numbers; desktop: one inline line */}
          <span className="mb-3 block font-semibold md:mb-0">
            <span className="md:hidden">Your position</span>
            <span className="hidden md:inline">You</span>
          </span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:contents">
            <Inline label="Collateral" value={`$${formatMillions(userDeposit)}`} />
            <Inline label="Debt" value={`${formatMillions(userDebt)} USG`} />
            {lowest && (
              <Inline label="Lowest health" value={<span className={lowest.health < HEALTH_AT_RISK ? "text-warning" : undefined}>{lowest.label}</span>} />
            )}
            <Inline
              label="Points"
              value={
                <HoverInfo
                  title="Your points"
                  contentClassName="w-fit rounded-lg p-2 text-ink-2"
                  trigger={<span className="underline decoration-white/20 decoration-dotted underline-offset-4">{formatMillions(points)} pts</span>}
                  content={`LP points ${formatMillions(lpUserPoints?.lpTotalPoints)}, vote points ${formatMillions(voteUserPoints?.voteTotalPoints)}`}
                />
              }
            />
          </div>
        </div>
      )}

      {/* toolbar: same filters as the live list (single select), plus sort and view */}
      {/* toolbar stays under the top bar while the table scrolls (Aave Pro) */}
      <div className="z-20 -mx-4 mb-4 mt-10 flex flex-wrap items-center gap-2 bg-page px-4 py-3 md:sticky md:top-16 md:-mx-6 md:mt-12 md:px-6 lg:top-0 lg:-mx-8 lg:px-8">
        <div role="tablist" className="flex h-10 w-full items-center gap-0.5 rounded-[10px] bg-white/[0.03] p-1 ring-1 ring-inset ring-hairline sm:w-auto">
          {SHOW.map((s) => (
            <button
              key={s.value}
              role="tab"
              aria-selected={filteredBy === s.value}
              onClick={() => setFilteredBy(s.value)}
              className={cn(
                "relative h-8 min-w-0 flex-1 whitespace-nowrap rounded-[6px] px-2 text-[12px] font-medium transition-colors min-[380px]:px-3 min-[380px]:text-[13px] sm:flex-none",
                filteredBy === s.value ? "text-white" : "text-ink-3 hover:text-ink-2"
              )}
            >
              {filteredBy === s.value && <span className="absolute inset-0 rounded-[6px] bg-white/[0.14] md:bg-white/[0.09]" />}
              <span className="relative">{s.label}</span>
            </button>
          ))}
        </div>
        <SelectMenu label="Type" value={marketType} options={typeOptions} onChange={setMarketType} allValue="All" className="hidden md:flex" />
        <SelectMenu label="Protocol" value={protocol} options={protocolOpts} onChange={setProtocol} allValue="All" className="hidden md:flex" />
        {/* phones: search and one Filters button on the same row; the filters open in a sheet */}
        <div className="flex w-full gap-2 md:contents">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-white/[0.03] px-3.5 text-[13px] ring-1 ring-inset ring-hairline focus-within:ring-white/20 md:ml-auto md:w-[220px] md:flex-none">
            <Search className="h-3.5 w-3.5 text-ink-3" strokeWidth={1.75} />
            <input
              value={searchValue ?? ""}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Filter markets"
              className="w-full bg-transparent outline-none placeholder:text-ink-3"
            />
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label="Filters and sort"
            className={cn(
              "relative grid h-10 w-10 shrink-0 place-items-center rounded-[10px] ring-1 ring-inset transition-colors md:hidden",
              activeFilters ? "bg-white/[0.08] text-white ring-white/15" : "bg-white/[0.03] text-ink-2 ring-hairline"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
            {activeFilters > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-action-fill px-1 text-[10px] font-semibold tabular-nums text-white">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
        <SelectMenu label="Sort" value={sort.key} options={SORTS} onChange={setSort} className="hidden md:flex" />
        <div
          role="radiogroup"
          aria-label="View"
          className="hidden h-10 items-center gap-0.5 rounded-[10px] bg-white/[0.03] p-1 ring-1 ring-inset ring-hairline md:flex"
        >
          {(
            [
              ["list", List],
              ["cards", LayoutGrid],
            ] as const
          ).map(([v, Icon]) => (
            <button
              key={v}
              role="radio"
              aria-checked={view === v}
              aria-label={v === "list" ? "List view" : "Card view"}
              onClick={() => setView(v)}
              className={cn("relative grid h-8 w-8 place-items-center rounded-[6px]", view === v ? "text-white" : "text-ink-3 hover:text-ink-2")}
            >
              {view === v && <span className="absolute inset-0 rounded-[6px] bg-white/[0.09]" />}
              <Icon className="relative h-4 w-4" strokeWidth={1.75} />
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-hairline bg-surface p-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="v2-shimmer h-12 rounded-lg" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-surface px-4 py-16 text-center">
          <div className="text-[15px] font-semibold">{filteredBy === "deposits" ? "You have no deposit yet" : "No market matches these filters"}</div>
          <p className="mt-1 text-[13px] text-ink-2">
            {filteredBy === "deposits"
              ? "Open a market and deposit collateral to see it here."
              : "Change the type or protocol, or try a token symbol such as USDC."}
          </p>
          <button
            onClick={() => {
              setFilteredBy("all")
              setMarketType("All")
              setProtocol("All")
              setSearchValue(null)
            }}
            className="mt-4 h-9 rounded-[9px] bg-white/[0.07] px-4 text-[13px] font-semibold transition-colors hover:bg-white/10"
          >
            Show all markets
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6 md:hidden">
            {(grouped ? groups : [{ k: "", rows: sorted }]).map((g) => (
              <div key={g.k || "all"}>
                {g.k && <GroupHead kind={g.k} rows={g.rows} flush />}
                <div className="space-y-2">
                  {g.rows.map((r) => (
                    <MobileRow key={r.address} r={r} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            {view === "list" ? (
              <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface px-2 pb-3">
                <div className="min-w-[900px]">
                  <div className="grid grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.85fr))_minmax(0,0.9fr)_minmax(0,1.25fr)_24px] gap-4 px-4 pb-2 pt-4 text-xs text-ink-3">
                    <SortHead k="collateral" sort={sort} onSort={toggleSort}>
                      Collateral
                    </SortHead>
                    <SortHead k="vapr" sort={sort} onSort={toggleSort} info="vAPR of the collateral. Hover a value for its breakdown.">
                      Collateral vAPR
                    </SortHead>
                    <SortHead k="borrowRate" sort={sort} onSort={toggleSort} info="Interest rate that borrowers pay on their outstanding debt.">
                      Borrow rate
                    </SortHead>
                    <SortHead k="maxvapr" sort={sort} onSort={toggleSort} info="Net vAPR at max leverage.">
                      Max lev. vAPR
                    </SortHead>
                    <SortHead k="tvl" sort={sort} onSort={toggleSort} info="Value of the collateral deposited in the market.">
                      TVL
                    </SortHead>
                    <SortHead
                      k="borrowed"
                      sort={sort}
                      onSort={toggleSort}
                      info="USG borrowed out of the market's borrow cap. At the cap, borrowing pauses until debt is repaid."
                    >
                      Borrow capacity
                    </SortHead>
                    <span />
                  </div>
                  {grouped
                    ? groups.map((g) => (
                        <div key={g.k}>
                          <GroupHead kind={g.k} rows={g.rows} />
                          {g.rows.map((r) => (
                            <Row key={r.address} r={r} />
                          ))}
                        </div>
                      ))
                    : sorted.map((r) => <Row key={r.address} r={r} />)}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {(grouped ? groups : [{ k: "", rows: sorted }]).map((g) => (
                  <div key={g.k || "all"}>
                    {g.k && <GroupHead kind={g.k} rows={g.rows} flush />}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <AnimatePresence initial={false}>
                        {g.rows.map((r) => (
                          <Card key={r.address} r={r} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <ActionSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <FilterGroup title="Type" options={typeOptions} value={marketType} onChange={setMarketType} />
        <FilterGroup title="Protocol" options={protocolOpts} value={protocol} onChange={setProtocol} />
        <FilterGroup title="Sort by" options={SORTS} value={sort.key} onChange={setSort} />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMarketType("All")
              setProtocol("All")
              setSort("default")
            }}
            className="h-11 flex-1 rounded-[10px] bg-white/[0.07] text-[14px] font-semibold transition-colors hover:bg-white/10"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="h-11 flex-[2] rounded-[10px] bg-action-fill text-[14px] font-semibold text-white transition-colors hover:bg-action-fill-hover"
          >
            Show {sorted.length} {sorted.length === 1 ? "market" : "markets"}
          </button>
        </div>
      </ActionSheet>
    </div>
  )
}

/** Phone filter group: every option visible as a tap target, the selected one filled. */
function FilterGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-[12px] font-medium text-ink-3">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={cn(
                "h-9 rounded-[8px] px-3 text-[13px] font-medium ring-1 ring-inset transition-colors",
                on ? "bg-white text-black ring-white" : "bg-white/[0.03] text-ink-2 ring-hairline active:bg-white/[0.07]"
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** One overview number, no card: the 2x2 grid is drawn by hairlines (right and bottom edges), like a table. */
function Tile({ label, value, foot }: { label: string; value: string; foot: string }) {
  return (
    <div className="flex flex-col border-hairline px-6 py-5 [&:nth-child(-n+2)]:border-b [&:nth-child(odd)]:border-r">
      <span className="text-[13px] font-medium text-ink-2">{label}</span>
      <span className={cn("mt-2 text-[26px] font-medium tabular-nums tracking-[-0.02em]", value === "-" && "animate-pulse text-ink-3")}>
        <Roll value={value} />
      </span>
      <div className="mt-1.5 text-xs text-ink-3">{foot}</div>
    </div>
  )
}

function Inline({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col gap-1 md:flex-row md:items-baseline md:gap-2">
      <span className="text-[12px] text-ink-3 md:text-[13px]">{label}</span>
      <span className="truncate text-[16px] font-medium tabular-nums md:text-[13px]">{value}</span>
    </span>
  )
}

/** Column header that sorts on click, like the live list: active column in white with its direction, definition on hover. */
function SortHead({
  k,
  sort,
  onSort,
  info,
  children,
}: {
  k: string
  sort: { key: string; dir: "asc" | "desc" }
  onSort: (key: string) => void
  info?: string
  children: ReactNode
}) {
  const active = sort.key === k
  return (
    <button
      type="button"
      onClick={() => onSort(k)}
      className={cn("flex w-fit items-center gap-1 text-left transition-colors", active ? "text-white" : "hover:text-ink-2")}
    >
      {info ? <Term info={info}>{children}</Term> : children}
      <ChevronDown
        className={cn("h-3.5 w-3.5 transition-[transform,opacity]", active ? "opacity-100" : "opacity-0", active && sort.dir === "asc" && "rotate-180")}
        strokeWidth={2}
      />
    </button>
  )
}

function GroupHead({ kind, rows, flush }: { kind: string; rows: ListRowData[]; flush?: boolean }) {
  const tvl = rows.reduce((s, r) => s + Number(formatUnits(BigInt(r.totalCollateralUSDValue || "0"), 18)), 0)
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5", flush ? "px-1 pb-3" : "px-4 pb-3 pt-6")}>
      <span className="text-[14px] font-semibold">{kind}</span>
      <span className="text-[13px] text-ink-2">
        {KINDS[kind]?.title}, {KINDS[kind]?.rule}
      </span>
      <span className="ml-auto text-xs tabular-nums text-ink-3">
        {rows.length} {rows.length > 1 ? "markets" : "market"} · ${formatMillions(tvl)} TVL
      </span>
    </div>
  )
}

function capacity(r: ListRowData) {
  const borrowed = Number(ind(r, "borrowed")?.raw || 0)
  const cap = Number(r.maxBorrowable || 0)
  return { ratio: cap > 0 ? Math.min(1, borrowed / cap) : 0, label: `${ind(r, "borrowed")?.value} / ${ind(r, "borrowed")?.subValue}` }
}

/** Market status chips. In the table (iconOnly) they shrink to the icon so the name keeps its room; the label shows on hover. */
function Status({ r, iconOnly }: { r: ListRowData; iconOnly?: boolean }) {
  const pos = usePositionHealth().get(r.address.toLowerCase())
  const paused = r.isDepositPaused || r.isBorrowPaused || r.isLeveragePaused
  if (!paused && !r.userHasDeposited && !pos) return null
  const risky = !!pos && pos.health < HEALTH_AT_RISK
  const pausedLabel = r.isDepositPaused ? "Deposits paused" : r.isBorrowPaused ? "Borrowing paused" : "Leverage paused"
  const chip = (icon: ReactNode, text: string) =>
    iconOnly ? (
      <span className="inline-flex">
        <StatusChip icon={icon} className="w-5 justify-center px-0">
          <span className="sr-only">{text}</span>
        </StatusChip>
      </span>
    ) : (
      <StatusChip icon={icon}>{text}</StatusChip>
    )
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {r.userHasDeposited && chip(<Wallet strokeWidth={2} />, "Your deposit")}
      {pos && (
        <StatusChip icon={risky ? <TriangleAlert className="text-warning" strokeWidth={2} /> : <HeartPulse strokeWidth={2} />}>
          {iconOnly ? pos.label : `Health ${pos.label}`}
        </StatusChip>
      )}
      {paused && chip(<Pause className="fill-current text-warning" strokeWidth={0} />, pausedLabel)}
    </span>
  )
}

function Row({ r }: { r: ListRowData }) {
  const { ratio, label } = capacity(r)
  const lev = Number(ind(r, "maxvapr")?.value)
  const levProj = Number(ind(r, "maxvapr")?.subValue)
  const rate = ind(r, "borrowRate")
  return (
    <Link
      href={`/${r.address}/deposit-borrow`}
      className="group grid grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.85fr))_minmax(0,0.9fr)_minmax(0,1.25fr)_24px] items-center gap-4 border-b border-white/[0.06] px-4 py-4 outline-none transition-colors duration-150 last:border-b-0 hover:bg-white/[0.035] focus-visible:bg-white/[0.035]"
    >
      <span className="flex min-w-0 items-center gap-3">
        <TokenImage token={r.logoKey} size={48} className="h-9 w-auto shrink-0" />
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-2 leading-5">
            <span className="truncate text-[14px] font-semibold">{r.name}</span>
            <Status r={r} iconOnly />
          </span>
          <Venue type={r.protocol} dense className="mt-1 text-xs leading-4 text-ink-3" />
        </span>
      </span>
      <Vapr r={r} />
      <Two top={rate?.value ?? "-"} sub={r.isFixedRate ? "Fixed rate" : "Variable"} />
      <Two top={pct(lev)} sub={Number.isNaN(levProj) ? "No projection" : `Proj. ${pct(levProj)}`} />
      <Two top={ind(r, "tvl")?.value ?? "-"} sub={`Max LTV ${(r.maxLTV * 100).toFixed(0)}%`} />
      <span className="min-w-0">
        <span className={cn("block text-[15px] tabular-nums leading-5", r.isBorrowCapReached && "text-warning")}>
          {r.isBorrowCapReached ? "Cap reached" : `${Math.round(ratio * 100)}%`}
        </span>
        <span className="mt-1 flex items-center gap-2">
          <Ticks ratio={ratio} full={r.isBorrowCapReached} />
          <span className="truncate text-xs tabular-nums text-ink-3">{label}</span>
        </span>
      </span>
      <ChevronRight
        className="h-4 w-4 text-ink-3 opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
        strokeWidth={1.75}
      />
    </Link>
  )
}

/**
 * Market card (Aave Pro earn cards): identity on top, the yield as the hero with the leveraged yield beside it,
 * then label/value rows. Same row data and formatting as the list, nothing new is loaded.
 */
function Card({ r }: { r: ListRowData }) {
  const { ratio, label } = capacity(r)
  const lev = Number(ind(r, "maxvapr")?.value)
  const levProj = Number(ind(r, "maxvapr")?.subValue)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18 }}
    >
      <Link
        href={`/${r.address}/deposit-borrow`}
        className="focus-visible:ring-action/60 group flex h-full flex-col rounded-2xl border border-hairline bg-surface p-5 outline-none transition-colors duration-150 hover:border-white/15 hover:bg-raised focus-visible:ring-2"
      >
        <div className="flex items-start gap-3">
          <TokenImage token={r.logoKey} size={48} className="h-8 w-auto shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[15px] font-semibold leading-5">{r.name}</span>
              <Status r={r} />
            </span>
            <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs leading-4 text-ink-3">
              {kindOf(r)}
              <span className="opacity-50">·</span>
              <Venue type={r.protocol} />
            </span>
          </span>
          <ChevronRight
            className="mt-1 h-4 w-4 shrink-0 text-ink-3 transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-white"
            strokeWidth={1.75}
          />
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[13px] text-ink-2">Collateral vAPR</div>
            <div className="mt-1 flex items-center gap-1.5 text-[26px] font-semibold tabular-nums leading-8 tracking-[-0.02em]">
              <Roll value={pct(r.apr.current)} />
              <AprMark className="h-3.5 w-3.5" />
            </div>
            <div className="mt-0.5 text-xs tabular-nums text-ink-3">Projected {pct(r.apr.projected)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-ink-3">Max lev. vAPR</div>
            <div className="mt-1 text-[17px] font-medium tabular-nums leading-6">
              <Roll value={pct(lev)} />
            </div>
            <div className="mt-0.5 text-xs tabular-nums text-ink-3">{Number.isNaN(levProj) ? "No projection" : `Projected ${pct(levProj)}`}</div>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-divider pt-4 text-[13px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-ink-2">TVL</span>
            <span className="tabular-nums">
              <span className="font-medium">{ind(r, "tvl")?.value}</span>
              <span className="ml-1.5 text-ink-3">Max LTV {(r.maxLTV * 100).toFixed(0)}%</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-ink-2">Borrow rate</span>
            <span className="tabular-nums">
              <span className="font-medium">{ind(r, "borrowRate")?.value}</span>
              <span className="ml-1.5 text-ink-3">{r.isFixedRate ? "Fixed" : "Variable"}</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-2">Borrow capacity</span>
            <span className="flex items-center gap-2.5">
              <Ticks ratio={ratio} full={r.isBorrowCapReached} />
              <span className={cn("w-[72px] text-right font-medium tabular-nums", r.isBorrowCapReached && "text-warning")}>
                {r.isBorrowCapReached ? "Cap reached" : `${Math.round(ratio * 100)}% used`}
              </span>
            </span>
          </div>
          <div className="text-right text-xs tabular-nums text-ink-3">{label} USG borrowed</div>
        </div>
      </Link>
    </motion.div>
  )
}

function Two({ top, sub, topClass, subClass }: { top: string; sub: string; topClass?: string; subClass?: string }) {
  return (
    <span className="min-w-0">
      <span className={cn("block text-[15px] tabular-nums leading-5", topClass)}>{top}</span>
      <span className={cn("mt-1 block text-xs tabular-nums leading-4 text-ink-3", subClass)}>{sub}</span>
    </span>
  )
}

/** 20 ticks, 1 tick = 5% of the borrow cap. Blue while there is room, amber at the cap. */
function Ticks({ ratio, full }: { ratio: number; full?: boolean }) {
  const on = Math.round(ratio * 20)
  return (
    <span className="flex shrink-0 gap-[2px]" aria-hidden>
      {Array.from({ length: 20 }, (_, i) => (
        <span key={i} className={cn("h-2.5 w-[3px] rounded-[1px]", i < on ? (full ? "bg-warning" : "bg-action") : "bg-white/10")} />
      ))}
    </span>
  )
}

/** vAPR column: the value that matters, with the live per-token breakdown on hover. */
function Vapr({ r }: { r: ListRowData }) {
  return (
    <span className="min-w-0">
      <HoverCard openDelay={120} closeDelay={80}>
        <HoverCardTrigger asChild>
          <span className="group/apr inline-flex w-fit items-center gap-1 text-[15px] font-semibold tabular-nums leading-5 transition-colors hover:text-action">
            {pct(r.apr.current)}
            <AprMark />
          </span>
        </HoverCardTrigger>
        <HoverCardContent side="top" align="start" className="z-[9999] w-[240px] rounded-[10px] border-white/10 bg-raised p-3 text-xs text-white">
          <div className="flex items-center gap-1.5 font-semibold">
            <TokenImage token={r.logoKey} size={16} className="h-4 w-auto" /> {r.name}
          </div>
          <Breakdown title="Current vAPR" total={r.apr.current} details={r.currentAPRDetails} />
          {r.protocol !== "Pendle_PT" && <Breakdown title="Projected vAPR" total={r.apr.projected} details={r.projectedAPRDetails} />}
        </HoverCardContent>
      </HoverCard>
      <span className="mt-1 block text-xs tabular-nums leading-4 text-ink-3">Proj. {pct(r.apr.projected)}</span>
    </span>
  )
}

function Breakdown({ title, total, details }: { title: string; total?: number; details?: Record<string, number> }) {
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

/** Phone row: one tap target per market. Name and venue on the left, the collateral vAPR on the right, then the three numbers that decide a borrow. */
function MobileRow({ r }: { r: ListRowData }) {
  const { ratio } = capacity(r)
  const lev = Number(ind(r, "maxvapr")?.value)
  return (
    <Link
      href={`/${r.address}/deposit-borrow`}
      className="block rounded-2xl border border-hairline bg-surface p-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[rgba(0,117,255,0.6)] active:bg-raised"
    >
      <div className="flex items-center gap-3">
        <TokenImage token={r.logoKey} size={48} className="h-9 w-auto shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold leading-5">{r.name}</span>
          <Venue type={r.protocol} dense className="mt-1 text-xs leading-4 text-ink-3" />
        </span>
        <span className="text-right">
          <span className="flex items-center justify-end gap-1 text-[17px] font-semibold tabular-nums leading-6">
            {pct(r.apr.current)}
            <AprMark className="h-3.5 w-3.5" />
          </span>
          <span className="block text-[11px] text-ink-3">Collateral vAPR</span>
        </span>
      </div>
      <div className="mt-2 empty:hidden">
        <Status r={r} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-divider pt-3 text-[13px]">
        <span className="min-w-0">
          <span className="block text-[11px] text-ink-3">Borrow rate</span>
          <span className="block truncate font-medium tabular-nums">{ind(r, "borrowRate")?.value ?? "-"}</span>
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] text-ink-3">Max lev.</span>
          <span className="block truncate font-medium tabular-nums">{pct(lev)}</span>
        </span>
        <span className="min-w-0 text-right">
          <span className="block text-[11px] text-ink-3">TVL · cap</span>
          <span className={cn("block truncate font-medium tabular-nums", r.isBorrowCapReached && "text-warning")}>
            {ind(r, "tvl")?.value ?? "-"} · {r.isBorrowCapReached ? "full" : `${Math.round(ratio * 100)}%`}
          </span>
        </span>
      </div>
    </Link>
  )
}

/** Positions under the health warning line, with shortcuts to add collateral or repay on the most fragile one. */
function RiskAlert({ atRisk, className }: { atRisk: { r: ListRowData; pos: PositionHealth }[]; className?: string }) {
  return (
    <div role="status" className={cn("flex gap-3 rounded-2xl border border-hairline bg-white/[0.04] p-4", className)}>
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold">
          {atRisk.length} {atRisk.length > 1 ? "positions" : "position"} near liquidation
        </div>
        <div className="mt-0.5 text-[13px] text-ink-2">
          {atRisk.map(({ r, pos }, i) => (
            <span key={r.address}>
              {i > 0 && " · "}
              <Link href={`/${r.address}/deposit-borrow`} className="underline decoration-white/25 underline-offset-4 hover:text-white">
                {r.name}
              </Link>
              , health {pos.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
