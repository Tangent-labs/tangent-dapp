"use client"

import { Roll } from "@/v2/ui/roll"
import { useMemo, useState } from "react"
import { formatUnits } from "viem"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ListState } from "@/types"
import { AprOpportunityItem } from "@/components/products/usg/usg_type"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { useUSGEarnContext } from "@/components/products/usg/earn/usg_earn_context"
import { protocolConfig, ProtocolName } from "@/components/products/usg/earn/usg_earn_controller"
import { protocolOptions } from "@/components/products/usg/list/usg_market_controller"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { formatMillions } from "@/lib/number_formatter"
import { SelectMenu } from "@/v2/ui/select-menu"
import { AprHover } from "@/v2/ui/apr-hover"

type SortKey = "currentAPR" | "points"

const pct = (n?: number) => (n === undefined || Number.isNaN(n) ? "-" : `${n.toFixed(2)}%`)
const label = (i: AprOpportunityItem) => i.asset.replaceAll("-", "/")

/**
 * V2 Earn page. Same context (USGEarnContext: rows, search, protocol filter, sort) and same rows as USGEarnContent.
 * The flat list of opportunities is grouped by asset: one line per pool with its best vAPR, one line per protocol when opened.
 */
export function EarnPageV2() {
  const { displayRows, getSortedRows, isLoading, USGsUSGMetrics, lpUserPoints, searchValue, setSearchValue, protocolFilter, setProtocolFilter } =
    useUSGEarnContext()
  const { voteUserPoints } = useUSGContext()
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "currentAPR", direction: "desc" })
  const [open, setOpen] = useState<string | null>(null)

  const sorted = useMemo(
    () => getSortedRows(displayRows, { search: undefined, sort: { key: sort.key, direction: sort.direction } } as ListState) as AprOpportunityItem[],
    [displayRows, getSortedRows, sort]
  )

  const pools = useMemo(() => {
    const map = new Map<string, AprOpportunityItem[]>()
    sorted.forEach((r) => map.set(r.asset, [...(map.get(r.asset) ?? []), r]))
    const bestOf = (rows: AprOpportunityItem[]) => Math.max(...rows.map((r) => r.currentAPR ?? 0))
    const bestPts = (rows: AprOpportunityItem[]) => Math.max(...rows.map((r) => r.points ?? 0))
    return [...map.entries()]
      .map(([asset, rows]) => ({
        asset,
        rows,
        best: bestOf(rows),
        points: bestPts(rows),
        top: rows.find((r) => (r.currentAPR ?? 0) === bestOf(rows)) ?? rows[0],
      }))
      .sort((a, b) => {
        const k = sort.key === "points" ? "points" : "best"
        return sort.direction === "desc" ? b[k] - a[k] : a[k] - b[k]
      })
  }, [sorted, sort])

  const best = useMemo(() => [...displayRows].sort((a, b) => (b.currentAPR ?? 0) - (a.currentAPR ?? 0))[0], [displayRows])
  const protocols = new Set(displayRows.map((r) => r.protocolName)).size
  const usg = Number(formatUnits(USGsUSGMetrics?.USGBalance ?? 0n, 18))
  const susg = Number(formatUnits(USGsUSGMetrics?.sUSGBalance ?? 0n, 18))
  const points = (lpUserPoints?.lpTotalPoints || 0) + (voteUserPoints?.voteTotalPoints || 0)

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, direction: s.direction === "desc" ? "asc" : "desc" } : { key, direction: "desc" }))

  return (
    <div className="w-full pb-20 pt-2 font-sans">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Earn</h1>
      <p className="mt-1 max-w-[760px] text-[14px] text-ink-2">
        Use USG and sUSG in DeFi protocols to earn yield. Below is the list of known integrations across DEXs, yield boosters, lending markets and yield trading
        markets.
      </p>

      <div className="v2-kpis mt-8 grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr]">
        <Tile
          hero
          label="Best vAPR"
          value={best ? pct(best.currentAPR) : "-"}
          foot={best ? `${label(best)} on ${best.protocolName}` : "Loading opportunities"}
          loading={isLoading}
        />
        <Tile
          label="Opportunities"
          value={String(displayRows.length || "-")}
          foot={`${pools.length} pools across ${protocols} protocols`}
          loading={isLoading}
        />
        <Tile label="Your wallet" value={`${formatMillions(usg)} USG`} foot={`${formatMillions(susg)} sUSG · ${formatMillions(points)} pts`} />
      </div>

      <div className="mb-3 mt-8 flex flex-wrap items-center gap-2">
        <SelectMenu
          label="Protocol"
          value={protocolFilter}
          options={protocolOptions.map((o) => ({ ...o, label: o.value === "All" ? "All protocols" : o.label }))}
          onChange={setProtocolFilter}
          allValue="All"
        />
        <label className="ml-auto flex h-10 w-full items-center gap-2 rounded-[10px] bg-white/[0.03] px-3.5 text-[13px] ring-1 ring-inset ring-hairline focus-within:ring-white/20 sm:w-[240px]">
          <Search className="h-3.5 w-3.5 text-ink-3" strokeWidth={1.75} />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search a pool or protocol"
            className="w-full bg-transparent outline-none placeholder:text-ink-3"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface px-2 pb-3">
        <div className="md:min-w-[760px]">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_20px] gap-4 px-4 pb-2 pt-4 text-xs text-ink-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_28px]">
            <span>Pool</span>
            <span className="hidden md:block">Protocols</span>
            <SortHead active={sort.key === "currentAPR"} dir={sort.direction} onClick={() => toggleSort("currentAPR")}>
              Best vAPR
            </SortHead>
            <span className="hidden md:block">
              <SortHead active={sort.key === "points"} dir={sort.direction} onClick={() => toggleSort("points")}>
                Points / day / $
              </SortHead>
            </span>
            <span />
          </div>

          {isLoading && Array.from({ length: 6 }, (_, i) => <div key={i} className="v2-shimmer mx-2 my-1.5 h-12 rounded-lg" />)}
          {!isLoading && pools.length === 0 && (
            <div className="px-4 py-14 text-center">
              <div className="text-[15px] font-semibold">No opportunity matches</div>
              <p className="mt-1 text-[13px] text-ink-2">Change the protocol or search for a token, for example USDC.</p>
            </div>
          )}
          {!isLoading &&
            pools.map((p) => {
              const isOpen = open === p.asset
              return (
                <div key={p.asset} className={cn("rounded-[10px] transition-colors", isOpen ? "bg-white/[0.03]" : "hover:bg-white/[0.035]")}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : p.asset)}
                    aria-expanded={isOpen}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-4 px-4 py-3 text-left md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_28px]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <TokenImage token={p.top.asset} size={32} className="h-8 w-auto shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold leading-5">{label(p.top)}</span>
                        <span className="block truncate text-xs leading-4 text-ink-3">
                          {p.top.subLabel || `${p.rows.length} ${p.rows.length > 1 ? "protocols" : "protocol"}`}
                        </span>
                      </span>
                    </span>
                    <span className="hidden items-center md:flex">
                      {p.rows.slice(0, 4).map((r, i) => (
                        <ProtocolDot key={r.protocolName + i} name={r.protocolName} className={i ? "-ml-1.5" : ""} />
                      ))}
                      {p.rows.length > 4 && <span className="ml-1.5 text-xs text-ink-3">+{p.rows.length - 4}</span>}
                    </span>
                    <AprHover
                      name={label(p.top)}
                      logoKey={p.top.asset}
                      current={p.top.currentAPR}
                      projected={p.top.projectedAPR}
                      currentDetails={p.top.currentAPRDetails}
                      projectedDetails={p.top.projectedAPRDetails}
                    />
                    <span className="hidden text-[15px] tabular-nums md:block">{p.points ? p.points : "-"}</span>
                    <ChevronDown className={cn("h-4 w-4 text-ink-3 transition-transform duration-200", isOpen && "rotate-180")} strokeWidth={1.75} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { type: "spring", visualDuration: 0.3, bounce: 0.05 }, opacity: { duration: 0.18 } }}
                        className="overflow-hidden"
                      >
                        <div className="mx-2 mb-2 border-t border-divider pt-1">
                          {p.rows.map((r, i) => (
                            <a
                              key={r.protocolName + i}
                              href={r.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group grid grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-4 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.05] md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_28px]"
                            >
                              <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink-2 md:block md:pl-11">
                                <span className="md:hidden">
                                  <ProtocolDot name={r.protocolName} />
                                </span>
                                <span className="truncate">{r.name}</span>
                              </span>
                              <span className="hidden items-center gap-2 text-[13px] md:flex">
                                <ProtocolDot name={r.protocolName} />
                                {r.protocolName}
                              </span>
                              <AprHover
                                name={label(r)}
                                logoKey={r.asset}
                                current={r.currentAPR}
                                projected={r.projectedAPR}
                                currentDetails={r.currentAPRDetails}
                                projectedDetails={r.projectedAPRDetails}
                              />
                              <span className="hidden text-[14px] tabular-nums md:block">{r.points ? r.points : "-"}</span>
                              <ArrowUpRight className="h-4 w-4 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.75} />
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

/** Header number, no card: the first one leads, the others sit behind a hairline, like the stat strip on every V2 page. */
function Tile({ label, value, foot, loading, hero }: { label: string; value: string; foot: string; loading?: boolean; hero?: boolean }) {
  return (
    <div className={cn("flex flex-col py-1", hero ? "pr-8" : "border-l border-divider px-6")}>
      <span className="text-xs text-ink-3">{label}</span>
      <span
        className={cn(
          "mt-1 tabular-nums tracking-[-0.02em]",
          hero ? "text-[48px] font-light leading-[1.05]" : "text-[24px] font-medium",
          loading && "animate-pulse text-ink-3"
        )}
      >
        <Roll value={value} />
      </span>
      <div className="mt-1.5 text-xs text-ink-2">{foot}</div>
    </div>
  )
}

function SortHead({ active, dir, onClick, children }: { active: boolean; dir: "asc" | "desc"; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex w-fit items-center gap-1 text-left", active ? "text-white" : "hover:text-ink-2")}>
      {children}
      {active && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dir === "asc" && "rotate-180")} strokeWidth={2} />}
    </button>
  )
}

function ProtocolDot({ name, className }: { name: string; className?: string }) {
  const key = protocolConfig[name as ProtocolName]
  return (
    <span title={name} className={cn("grid h-6 w-6 place-items-center rounded-full border border-hairline bg-raised", className)}>
      {key ? <TokenImage token={key} size={16} className="h-4 w-4" /> : <span className="text-[9px] font-semibold text-ink-2">{name.slice(0, 2)}</span>}
    </span>
  )
}
