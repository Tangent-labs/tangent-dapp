"use client"

import { Roll } from "@/v2/ui/roll"
import { useMemo, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ListState } from "@/types"
import { HarvesterInfoDisplay } from "@/components/products/usg/usg_type"
import { useUSGHarvestContext } from "@/components/products/usg/harvest/usg_harvest_context"
import { harvestListHeaders } from "@/components/products/usg/harvest/usg_harvest_controller"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { Button } from "@/components/design_system/inputs/button"
import { Switch } from "@/components/ui/switch"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { formatDollar, formatPercent } from "@/lib/number_formatter"

type SortKey = (typeof harvestListHeaders)[number]["key"]
const GRID = "grid-cols-[28px_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]"

/**
 * V2 Harvest page. Same context (USGHarvestContext: rows, selection, select all, harvest handler, loading flags) as USGHarvestContent.
 * Same structure as Claim: selectable rows, a summary that stays in view.
 */
export function HarvestPageV2() {
  const { displayRows, marketsToHarvest, isChainviewLoading, isTxLoading, getSortedRows, onClickSelectAll, onClickHarvest, addToHarvestableMarkets } =
    useUSGHarvestContext()
  const { isConnected, connect } = useWalletConnexionContext()
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "totalRewards", direction: "desc" })

  const rows = useMemo(
    () => getSortedRows(displayRows, { search: undefined, sort: { key: sort.key, direction: sort.direction } } as ListState),
    [displayRows, getSortedRows, sort]
  )
  const allSelected = displayRows?.length > 0 && marketsToHarvest.length === displayRows.length
  const totalRewards = displayRows.reduce((s, r) => s + (r.rewards?.totalDollar || 0), 0)
  const harvesterRewards = displayRows.reduce((s, r) => s + ((r.rewards?.totalDollar || 0) * (r.percentage || 0)) / 100, 0)
  const selectedTotal = marketsToHarvest.reduce((s, m) => s + (m.harvestable || 0), 0)
  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, direction: s.direction === "desc" ? "asc" : "desc" } : { key, direction: "desc" }))

  return (
    <div className="w-full pb-20 pt-2 font-sans">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Harvest</h1>
      <p className="mt-1 max-w-[720px] text-[14px] text-ink-2">
        Harvest the rewards of Tangent markets. Harvester rewards are the share of a market&apos;s rewards that goes to whoever harvests it.
      </p>

      <div className="mt-8 flex flex-wrap items-stretch gap-y-4">
        <div className="min-w-[220px] flex-[1.6] pr-8">
          <div className="text-xs text-ink-3">Rewards waiting</div>
          <div className="mt-1 text-[48px] font-light tabular-nums leading-[1.05] tracking-[-0.02em]">
            <Roll value={isChainviewLoading ? "-" : formatDollar(totalRewards, 2)} />
          </div>
        </div>
        <Stat label="Harvester rewards" value={isChainviewLoading ? "-" : formatDollar(harvesterRewards, 2)} sub="Your share if you harvest all" />
        <Stat label="Markets" value={isChainviewLoading ? "-" : String(displayRows.length)} sub="With rewards to harvest" />
      </div>

      <div className="mt-10 grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface px-2 pb-3">
          <div className="min-w-[760px]">
            <div className={cn("grid items-center gap-4 px-4 pb-2 pt-4 text-xs text-ink-3", GRID)}>
              <span />
              {harvestListHeaders.map((h) => (
                <button
                  key={h.key}
                  type="button"
                  onClick={() => toggleSort(h.key)}
                  className={cn("flex w-fit items-center gap-1 text-left", sort.key === h.key ? "text-white" : "hover:text-ink-2")}
                >
                  {h.label}
                  {sort.key === h.key && (
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", sort.direction === "asc" && "rotate-180")} strokeWidth={2} />
                  )}
                </button>
              ))}
            </div>

            {isChainviewLoading && Array.from({ length: 4 }, (_, i) => <div key={i} className="v2-shimmer mx-2 my-1.5 h-12 rounded-lg" />)}
            {!isChainviewLoading && rows.length === 0 && (
              <div className="px-4 py-14 text-center">
                <div className="text-[15px] font-semibold">Nothing to harvest for now</div>
                <p className="mt-1 text-[13px] text-ink-2">Markets show up here when their rewards are ready to be harvested.</p>
              </div>
            )}

            {(rows as HarvesterInfoDisplay[]).map((item) => {
              const selected = !!marketsToHarvest.find((m) => m.marketAddress === item.contractAddress)
              const details = item.rewards?.details?.filter((r) => r?.dollarValue > 0) ?? []
              return (
                <button
                  key={item.contractAddress}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() =>
                    addToHarvestableMarkets({ ...item, marketName: item.asset, harvestable: item.rewards.totalDollar, marketAddress: item.contractAddress })
                  }
                  className={cn(
                    "grid w-full items-center gap-4 border-b border-white/[0.06] px-4 py-3.5 text-left transition-colors last:border-b-0",
                    GRID,
                    selected ? "bg-white/[0.06]" : "hover:bg-white/[0.035]"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-md border transition-colors",
                      selected ? "border-action bg-action" : "border-white/20"
                    )}
                  >
                    {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
                  </span>
                  <span className="flex min-w-0 items-center gap-3">
                    <TokenImage token={item.logoKey} size={32} className="h-8 w-auto shrink-0" />
                    <span className="truncate text-[14px] font-semibold">{item.logoKey?.replaceAll("-", "/")}</span>
                  </span>
                  <span className="group relative inline-block min-w-0">
                    <span className="peer text-[15px] font-semibold tabular-nums underline decoration-white/15 decoration-dotted underline-offset-4">
                      {formatDollar(item.rewards?.totalDollar || 0)}
                    </span>
                    {details.length > 0 && (
                      <span className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-[240px] rounded-[10px] border border-white/10 bg-raised p-3 text-xs shadow-[0_12px_32px_rgba(0,0,0,0.55)] peer-hover:block">
                        <span className="mb-1.5 block font-semibold">{item.asset} rewards</span>
                        {details.map((r, i) => (
                          <span key={i} className="mt-1 flex items-center gap-2 tabular-nums">
                            <TokenImage token={r.logoKey} size={16} className="h-4 w-4" />
                            <span className="w-16 truncate">{r.logoKey}</span>
                            <span className="ml-auto text-ink-3">{formatDollar(r.dollarValue)}</span>
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                  <span className="text-[15px] tabular-nums">{formatPercent(item.percentage)}</span>
                  <span className="text-[15px] tabular-nums">{formatDollar(((item.rewards?.totalDollar || 0) * (item.percentage || 0)) / 100)}</span>
                  <span className="text-[13px] text-ink-2">{item.lastHarvestDate}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="sticky top-24 rounded-2xl border border-hairline bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold">Harvest summary</span>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-2">
              Select all
              <Switch checked={allSelected} onClick={() => onClickSelectAll()} />
            </label>
          </div>
          <div className="mt-4 min-h-[88px] space-y-2.5 border-t border-divider pt-4">
            {marketsToHarvest.length === 0 && <p className="text-[13px] text-ink-3">Pick the markets you want to harvest from the list.</p>}
            {marketsToHarvest.map((m) => (
              <div key={m.marketAddress} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="flex min-w-0 items-center gap-2">
                  <TokenImage token={m.logoKey} size={24} className="h-5 w-auto shrink-0" />
                  <span className="truncate">{m.logoKey?.replaceAll("-", "/")}</span>
                </span>
                <span className="font-medium tabular-nums">{formatDollar(m.harvestable, 2)}</span>
              </div>
            ))}
          </div>
          {marketsToHarvest.length > 0 && (
            <div className="mt-4 flex items-baseline justify-between border-t border-divider pt-4 text-[13px]">
              <span className="text-ink-2">Total harvested</span>
              <Roll className="text-[17px] font-medium" value={formatDollar(selectedTotal, 2)} />
            </div>
          )}
          <div className="mt-4">
            {isConnected ? (
              <Button
                label={marketsToHarvest.length ? `Harvest ${marketsToHarvest.length} ${marketsToHarvest.length > 1 ? "markets" : "market"}` : "Harvest"}
                className="flex w-full items-center justify-center"
                hasLoadingState={true}
                isLoading={isTxLoading}
                state={isTxLoading || marketsToHarvest.length === 0 ? "disabled" : "active"}
                onClick={() => onClickHarvest()}
              />
            ) : (
              <Button label="Connect wallet" className="flex w-full items-center justify-center" onClick={connect} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-[150px] flex-1 border-l border-divider px-6">
      <div className="text-xs text-ink-3">{label}</div>
      <div className="mt-1 whitespace-nowrap text-[24px] font-medium tabular-nums tracking-[-0.02em]">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-ink-2">{sub}</div>}
    </div>
  )
}
