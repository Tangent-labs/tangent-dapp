"use client"

import { Roll } from "@/v2/ui/roll"
import { useMemo, useState } from "react"
import { formatUnits } from "viem"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ListState } from "@/types"
import { ClaimAsset, ClaimData } from "@/components/products/usg/usg_type"
import { useUSGClaimContext } from "@/components/products/usg/claim/usg_claim_context"
import { claimListHeaders } from "@/components/products/usg/claim/usg_claim_controller"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { Button } from "@/components/design_system/inputs/button"
import { Switch } from "@/components/ui/switch"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { formatDollar, formatMillions } from "@/lib/number_formatter"
import { AprHover } from "@/v2/ui/apr-hover"

type SortKey = (typeof claimListHeaders)[number]["key"]

/**
 * V2 Claim page. Same context (USGClaimContext: rows, selection, claim and claim-all handlers, totals) as USGClaimContent.
 * Rows are selectable, the claim summary sits on the right and stays in view.
 */
export function ClaimPageV2() {
  const {
    displayRows,
    onClickClaim,
    marketsToClaim,
    getSortedRows,
    isChainviewLoading,
    isTxLoading,
    onClickClaimAll,
    addToClaimableMarkets,
    totalDeposited,
    totalClaimable,
    weightedAPRAverage,
  } = useUSGClaimContext()
  const { isWellConnected, connect } = useWalletConnexionContext()
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "totalClaimableValue", direction: "desc" })

  const rows = useMemo(
    () => getSortedRows(displayRows, { search: undefined, sort: { key: sort.key, direction: sort.direction } } as ListState),
    [displayRows, getSortedRows, sort]
  )
  const allSelected = displayRows?.length > 0 && marketsToClaim.length === displayRows.length
  const selectedTotal = marketsToClaim.reduce((s, m) => s + (Number(String(m.claimable).replace(/[^0-9.-]/g, "")) || 0), 0)
  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, direction: s.direction === "desc" ? "asc" : "desc" } : { key, direction: "desc" }))

  return (
    <div className="w-full pb-20 pt-2 font-sans">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Claim</h1>
      <p className="mt-1 text-[14px] text-ink-2">Claim the rewards that come with your active positions.</p>

      <div className="mt-8 flex flex-wrap items-stretch gap-y-4">
        <div className="min-w-[220px] flex-[1.6] pr-8">
          <div className="text-xs text-ink-3">Total claimable</div>
          <div className="mt-1 text-[48px] font-light tabular-nums leading-[1.05] tracking-[-0.02em]">
            <Roll value={totalClaimable || "-"} />
          </div>
        </div>
        <Stat label="Average APR" value={!weightedAPRAverage || weightedAPRAverage.startsWith("-") ? "-" : weightedAPRAverage} sub="Weighted by deposit" />
        <Stat label="Total deposited" value={totalDeposited || "-"} sub="Across your positions" />
      </div>

      <div className="mt-10 grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface px-2 pb-3">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[28px_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 px-4 pb-2 pt-4 text-xs text-ink-3">
              <span />
              {claimListHeaders.map((h) => (
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

            {isWellConnected && isChainviewLoading && Array.from({ length: 4 }, (_, i) => <div key={i} className="v2-shimmer mx-2 my-1.5 h-12 rounded-lg" />)}

            {(!isWellConnected || !isChainviewLoading) && rows.length === 0 && (
              <div className="px-4 py-14 text-center">
                <div className="text-[15px] font-semibold">{isWellConnected ? "Nothing to claim for now" : "Connect your wallet"}</div>
                <p className="mt-1 text-[13px] text-ink-2">
                  {isWellConnected ? "Rewards from your active positions will show up here." : "See the rewards waiting on your positions."}
                </p>
                {!isWellConnected && (
                  <button
                    onClick={connect}
                    className="mt-4 h-9 rounded-[9px] bg-action px-4 text-[13px] font-semibold text-white transition-colors hover:bg-action-hover"
                  >
                    Connect wallet
                  </button>
                )}
              </div>
            )}

            {(rows as ClaimData[]).map((item) => {
              const selected = !!marketsToClaim.find((m) => m.marketAddress === item.marketAddress)
              return (
                <button
                  key={item.marketAddress}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() =>
                    addToClaimableMarkets({
                      marketName: item.marketName,
                      claimable: item.totalClaimableValue,
                      marketAddress: item.marketAddress,
                      logoKey: item.logoKey,
                      rewards: item.claimable,
                    })
                  }
                  className={cn(
                    "grid w-full grid-cols-[28px_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 border-b border-white/[0.06] px-4 py-3.5 text-left transition-colors last:border-b-0",
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
                    <span className="truncate text-[14px] font-semibold">{item.marketName}</span>
                  </span>
                  <AprHover
                    name={item.marketName}
                    logoKey={item.logoKey}
                    current={item.apr?.current}
                    projected={item.apr?.projected}
                    currentDetails={item.currentAPRDetails}
                    projectedDetails={item.projectedAPRDetails}
                  />
                  <AprHoverRewards item={item} />
                  <span className="text-[15px] tabular-nums">${formatMillions(item.totalDepositedValue || 0)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* summary: stays in view while the list scrolls */}
        <div className="sticky top-24 rounded-2xl border border-hairline bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold">Claim summary</span>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-2">
              Select all
              <Switch checked={allSelected} onClick={() => onClickClaimAll()} />
            </label>
          </div>
          <div className="mt-4 min-h-[88px] space-y-2.5 border-t border-divider pt-4">
            {marketsToClaim.length === 0 && <p className="text-[13px] text-ink-3">Pick the markets you want to claim from the list.</p>}
            {marketsToClaim.map((m) => (
              <div key={m.marketAddress} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="flex min-w-0 items-center gap-2">
                  <TokenImage token={m.logoKey} size={24} className="h-5 w-auto shrink-0" />
                  <span className="truncate">{m.marketName}</span>
                </span>
                <span className="font-medium tabular-nums">${m.claimable}</span>
              </div>
            ))}
          </div>
          {marketsToClaim.length > 0 && (
            <div className="mt-4 flex items-baseline justify-between border-t border-divider pt-4 text-[13px]">
              <span className="text-ink-2">You receive</span>
              <Roll className="text-[17px] font-medium" value={formatDollar(selectedTotal, 2)} />
            </div>
          )}
          <div className="mt-4">
            {isWellConnected ? (
              <Button
                label={marketsToClaim.length ? `Claim ${marketsToClaim.length} ${marketsToClaim.length > 1 ? "markets" : "market"}` : "Claim"}
                className="flex w-full items-center justify-center"
                hasLoadingState={true}
                isLoading={isTxLoading}
                state={isTxLoading || marketsToClaim.length === 0 ? "disabled" : "active"}
                onClick={() => onClickClaim(marketsToClaim)}
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

/** Claimable value with the same per-reward breakdown the live row shows in its hover card. */
function AprHoverRewards({ item }: { item: ClaimData }) {
  return (
    <span className="group relative inline-block min-w-0">
      <span className="peer text-[15px] font-semibold tabular-nums underline decoration-white/15 decoration-dotted underline-offset-4">
        {formatDollar(item.totalClaimableValue || 0, 2)}
      </span>
      <span className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-[260px] rounded-[10px] border border-white/10 bg-raised p-3 text-xs shadow-[0_12px_32px_rgba(0,0,0,0.55)] peer-hover:block">
        <span className="mb-1.5 block font-semibold">{item.marketName} rewards</span>
        {(item.claimable as ClaimAsset[]).map((r) => (
          <span key={r.symbol} className="mt-1 flex items-center gap-2 tabular-nums">
            <TokenImage token={r.symbol} size={16} className="h-4 w-4" />
            <span>{Number(formatUnits(BigInt(r.amount), 18)).toFixed(2)}</span>
            <span className="w-10 text-ink-2">{r.symbol}</span>
            <span className="ml-auto text-ink-3">{formatDollar(r.valueInUsd)}</span>
          </span>
        ))}
      </span>
    </span>
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
