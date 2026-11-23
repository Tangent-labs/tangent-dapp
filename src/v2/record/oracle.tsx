"use client"

import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAddress } from "@/lib/other_formatter"
import { useUSGRecordContext } from "@/components/products/usg/record/usg_record_context"
import { useCollateralPriceContext } from "@/components/products/usg/record/collat_price/collat_price_context"
import { Term } from "@/v2/ui/term"

/**
 * Oracle block (Aave "Oracle configuration" pattern). Only what the page already loads: the last point of the oracle line
 * and of the market candles from CollateralPriceContext, and the Oracle address from the record context. Must sit inside CollateralPriceProvider.
 */
export function OracleV2() {
  const { oraclePriceData, graphData, isPending } = useCollateralPriceContext()
  const { collateralInfo, marketContracts } = useUSGRecordContext()
  const name = collateralInfo?.symbol?.replaceAll("-", "/")
  const oracle = oraclePriceData?.at(-1)
  const candle = graphData?.data?.at(-1)
  const oracleAddress = marketContracts?.find((c) => c.name === "Oracle")?.address
  const spread = oracle && candle?.close ? (oracle.value / candle.close - 1) * 100 : undefined

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
      <div>
        <div className="text-xs text-ink-3">
          <Term info="Price the market uses to value your collateral, for borrowing power and liquidations.">Oracle price</Term>
        </div>
        <div className={cn("mt-1 text-[24px] font-medium tabular-nums tracking-[-0.02em]", isPending && !oracle && "animate-pulse text-ink-3")}>
          {oracle ? `$${oracle.value.toFixed(5)}` : "-"}
        </div>
        <div className="mt-1 text-xs text-ink-3">1 {name}</div>
        <div className="mt-4 border-t border-divider pt-4">
          <div className="text-xs text-ink-3">
            <Term info="Last close of the market candles in the chart above.">Market price</Term>
          </div>
          <div className="mt-1 text-[15px] font-medium tabular-nums">{candle ? `$${candle.close.toFixed(5)}` : "-"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-hairline sm:grid-cols-2 md:border-l md:pl-8">
        <div>
          <div className="text-xs text-ink-3">Oracle contract</div>
          {oracleAddress ? (
            <a
              href={`https://etherscan.io/address/${oracleAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[14px] font-medium tabular-nums underline decoration-white/20 underline-offset-4 hover:text-action"
            >
              {formatAddress(oracleAddress, 4)} <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
          ) : (
            <div className="mt-1 text-[14px]">-</div>
          )}
        </div>
        <div>
          <div className="text-xs text-ink-3">
            <Term info="Oracle price relative to the last market close. A large gap means the oracle lags or the market moved.">Oracle vs market</Term>
          </div>
          <div className={cn("mt-1 text-[14px] font-medium tabular-nums", spread !== undefined && Math.abs(spread) >= 0.5 && "text-warning")}>
            {spread === undefined ? "-" : `${spread >= 0 ? "+" : "−"}${Math.abs(spread).toFixed(3)}%`}
          </div>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs leading-relaxed text-ink-3">Borrowing power, health and liquidations use the oracle price, not the market price.</p>
        </div>
      </div>
    </div>
  )
}
