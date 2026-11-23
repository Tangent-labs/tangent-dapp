"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { SavingsVault } from "@/components/products/usg/stake/savings_vaults"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { formatDollar, formatMillions } from "@/lib/number_formatter"

export type SavingsRowV2 = { vault: SavingsVault; apy?: number; tvl: number; deposit: number }

/**
 * V2 Savings products list (feat/sUSGreUSD). Markup only: rows, totals and the APY/TVL rules all come from SavingsProducts.
 * One card per product, on the V2 surface tokens, the yield first.
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

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <ProductCard key={row.vault.key} {...row} />
        ))}
      </div>
    </div>
  )
}

/** One savings product. Surface card on the page tokens; hover lifts it to raised with a soft blue light from the top and a blue go button. */
function ProductCard({ vault, apy, tvl, deposit }: SavingsRowV2) {
  return (
    <Link
      href={`/stake/${vault.key}`}
      className="focus-visible:border-action/60 group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface p-5 outline-none transition-colors duration-200 hover:border-white/[0.12] hover:bg-raised"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(0,117,255,0.22) 0%, rgba(0,117,255,0) 100%)" }}
      />
      <span className="relative flex items-center gap-3">
        <TokenImage token={vault.share.logo} size={48} className="h-10 w-auto shrink-0" />
        <span className="min-w-0">
          <span className="block text-[17px] font-semibold tracking-[-0.01em]">{vault.key}</span>
          <span className="block truncate text-xs text-ink-3">
            {vault.subtitle} · {vault.source}
          </span>
        </span>
      </span>

      <p className="relative mt-4 min-h-10 text-[13px] leading-5 text-ink-2">{vault.summary}</p>

      <span className="relative mt-4 grid grid-cols-2 gap-2">
        <span className="rounded-xl bg-white/[0.04] px-3.5 py-3">
          <span className="block text-xs text-ink-3">APY</span>
          <span className="mt-1 block text-[26px] font-light tabular-nums leading-none tracking-[-0.02em]">
            {apy === undefined ? <span className="text-ink-3">-</span> : `${apy.toFixed(2)}%`}
          </span>
        </span>
        <span className="rounded-xl bg-white/[0.04] px-3.5 py-3">
          <span className="block text-xs text-ink-3">TVL</span>
          <span className="mt-1.5 block text-[18px] font-medium tabular-nums leading-none">${formatMillions(tvl)}</span>
        </span>
      </span>

      <span className="relative mt-4 flex items-center justify-between gap-3 border-t border-divider pt-3.5">
        <span className="min-w-0 truncate text-[13px]">
          <span className="font-semibold">{vault.source === "Tangent" ? "Stake USG" : vault.depositLabel}</span>
          {vault.depositTokens && <span className="ml-2 text-ink-3">{vault.depositTokens}</span>}
          {deposit > 0 && <span className="ml-2 text-ink-2">· You have {formatDollar(deposit)}</span>}
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.07] text-ink-2 transition-colors duration-200 group-hover:bg-action group-hover:text-white">
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </span>
      </span>
    </Link>
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
