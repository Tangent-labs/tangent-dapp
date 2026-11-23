"use client"

import Link from "next/link"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { SavingsVault } from "@/components/products/usg/stake/savings_vaults"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { formatDollar, formatMillions } from "@/lib/number_formatter"
import { Term } from "@/v2/ui/term"

export type SavingsRowV2 = { vault: SavingsVault; apy?: number; tvl: number; deposit: number }

const GRID = "grid-cols-[minmax(0,1.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)_24px]"

/**
 * V2 Savings products list (feat/sUSGreUSD). Markup only: rows, totals and the APY/TVL rules all come from SavingsProducts.
 * Same table language as the markets list: one row per product, hairline separators, the yield first.
 */
export function SavingsProductsV2({
  rows,
  totalTvl,
  bestApy,
  deposits,
  docsHref,
}: {
  rows: SavingsRowV2[]
  totalTvl: number
  bestApy: number
  deposits: number
  docsHref: string
}) {
  return (
    <div className="mx-auto w-full max-w-[1264px] pb-20 pt-2 font-sans">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Savings</h1>
      <p className="mt-1 max-w-[720px] text-[14px] text-ink-2">
        Stake USG directly, or pick a Yearn V3 vault that auto-compounds a USG pool. All products are ERC4626 tokens and can be used further in DeFi.{" "}
        <Link
          href={docsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-white underline decoration-white/25 underline-offset-4 hover:decoration-white"
        >
          Learn more <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </p>

      <div className="mt-6 flex flex-wrap items-stretch gap-y-4">
        <div className="min-w-[220px] flex-[1.6] pr-8">
          <div className="text-xs text-ink-3">Best APY</div>
          <div className="mt-1 text-[48px] font-light tabular-nums leading-[1.05] tracking-[-0.02em]">{bestApy > 0 ? `${bestApy.toFixed(2)}%` : "-"}</div>
        </div>
        <Stat label="Total TVL" value={`$${formatMillions(totalTvl)}`} sub={`${rows.length} products`} />
        <Stat label="Your deposits" value={formatDollar(deposits)} sub="Across all products" />
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-hairline bg-surface px-2 pb-2">
        <div className="min-w-[860px]">
          <div className={`grid ${GRID} items-center gap-4 px-4 pb-2 pt-4 text-xs text-ink-3`}>
            <span>Product</span>
            <Term info="Yearly yield of the product. Yearn V3 vaults have no APY feed yet.">APY</Term>
            <span>TVL</span>
            <span>Your deposit</span>
            <span>You deposit</span>
            <span />
          </div>
          {rows.map(({ vault, apy, tvl, deposit }) => (
            <Link
              key={vault.key}
              href={`/stake/${vault.key}`}
              className={`group grid ${GRID} items-center gap-4 border-b border-white/[0.06] px-4 py-3.5 outline-none transition-colors duration-150 last:border-b-0 hover:bg-white/[0.035] focus-visible:bg-white/[0.035]`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <TokenImage token={vault.share.logo} size={32} className="h-8 w-auto shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold leading-5">{vault.key}</span>
                  <span className="block truncate text-xs leading-4 text-ink-3">
                    {vault.subtitle} · {vault.source}
                  </span>
                </span>
              </span>
              <span className="text-[15px] font-semibold tabular-nums">{apy === undefined ? <span className="text-ink-3">-</span> : `${apy.toFixed(2)}%`}</span>
              <span className="text-[15px] tabular-nums">${formatMillions(tvl)}</span>
              <span className="text-[15px] tabular-nums">{deposit > 0 ? formatDollar(deposit) : <span className="text-ink-3">-</span>}</span>
              <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink-2">
                <TokenImage token={vault.asset.logo} size={20} className="h-5 w-auto shrink-0" />
                <span className="truncate">{vault.asset.symbol}</span>
              </span>
              <ChevronRight
                className="h-4 w-4 text-ink-3 opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
                strokeWidth={1.75}
              />
            </Link>
          ))}
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
