"use client"

import { useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatBigIntAsNumber } from "@/lib/number_formatter"
import { getLTVColor, isVolatileCollateral } from "@/lib/risk_color"
import { useUSGRecordContext } from "@/components/products/usg/record/usg_record_context"

/** getLTVColor thresholds stay the live ones; V2 has no green, so "safe" reads in plain ink. */
const RISK_CLASS: Record<string, string> = { "#2e8b57": "text-white", "#f5c518": "text-warning", "#ff8c00": "text-alert", "#ff0000": "text-negative" }
/** the context formats a debt-free health as "0" */
const noDebt = (h: string) => (h === "0" || h === "-" ? "No debt" : h)
const riskClass = (hex?: string) => (hex ? (RISK_CLASS[hex] ?? "") : "")

/**
 * "Your loan" (Aave "Your position"), built on USGRecordContext only: marketDisplayData is today,
 * futureMarketDisplayData is after what the user is typing in the action card. Hidden when there is no loan and nothing typed.
 */
export function YourLoanV2() {
  const { marketDisplayData, futureMarketDisplayData, marketData, collateralInfo, currentAmounts, liquidationPrice } = useUSGRecordContext()

  const collateral = marketData?.collateralInfos?.positionCollateralAmount ?? 0n
  const debt = marketData?.debtInfos?.userDebt ?? 0n
  const hasLoan = collateral > 0n || debt > 0n
  const typing = Object.values(currentAmounts ?? {}).some((v) => !!v && v > 0n)

  const maxLtv = useMemo(() => parseFloat(marketDisplayData.maxLtv), [marketDisplayData.maxLtv])
  const volatile = useMemo(() => isVolatileCollateral(collateralInfo?.symbol ?? ""), [collateralInfo?.symbol])
  const nowTone = riskClass(getLTVColor(marketDisplayData.ltv, maxLtv, volatile))
  const afterTone = riskClass(getLTVColor(futureMarketDisplayData.ltv, maxLtv, volatile))
  // same scaling as the live collateral price chart (usg_collateral_price.tsx)
  const liq = Number(Number(liquidationPrice / 10n ** 15n).toFixed(4)) / 1000

  const Row = ({ label, now, after, tone, afterToneClass }: { label: string; now: string; after: string; tone?: string; afterToneClass?: string }) => (
    <div className="flex items-baseline justify-between gap-3 text-[13px]">
      <span className="text-ink-2">{label}</span>
      <span className="flex items-baseline gap-1.5 tabular-nums">
        {typing && after !== now && (
          <>
            <span className={cn("text-ink-3", tone)}>{now}</span>
            <span className="text-ink-3">→</span>
          </>
        )}
        <span className={cn("font-medium", typing ? afterToneClass : tone)}>{typing ? after : now}</span>
      </span>
    </div>
  )

  return (
    <AnimatePresence initial={false}>
      {(hasLoan || typing) && (
        <motion.div
          key="your-loan"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ height: { type: "spring", visualDuration: 0.3, bounce: 0.1 }, opacity: { duration: 0.2 } }}
          className="overflow-hidden"
        >
          <div className="rounded-2xl border border-hairline bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">Your loan</span>
              <span className="flex items-center gap-1.5 text-xs text-ink-2">
                <span className={cn("h-1.5 w-1.5 rounded-full", typing ? "bg-action" : "bg-white/80")} />
                {typing ? (hasLoan ? "Today → after this action" : "After this action") : "Open"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-ink-3">Collateral</div>
                <div className="mt-1 text-[17px] font-medium tabular-nums">
                  {typing ? futureMarketDisplayData.collateralValue : marketDisplayData.collateralValue}
                </div>
                {hasLoan && (
                  <div className="text-xs tabular-nums text-ink-3">
                    {formatBigIntAsNumber(collateral, collateralInfo?.decimals, collateralInfo?.displayDecimals)} {marketData?.collateralInfo?.symbol}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-ink-3">Debt</div>
                <div className="mt-1 text-[17px] font-medium tabular-nums">{typing ? futureMarketDisplayData.debt : marketDisplayData.debt} USG</div>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 border-t border-divider pt-4">
              <Row
                label="Health"
                now={noDebt(marketDisplayData.health)}
                after={noDebt(futureMarketDisplayData.health)}
                tone={nowTone}
                afterToneClass={afterTone}
              />
              <Row label="LTV" now={marketDisplayData.ltv} after={futureMarketDisplayData.ltv} tone={nowTone} afterToneClass={afterTone} />
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="text-ink-2">Max LTV</span>
                <span className="font-medium tabular-nums">{marketDisplayData.maxLtv}</span>
              </div>
              {liq > 0 && (
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="text-ink-2">Liquidation price{typing ? ", after" : ""}</span>
                  <span className="font-medium tabular-nums">${liq.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
