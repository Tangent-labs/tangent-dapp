"use client"

import { CollateralGraph } from "../usg_collateral_price"
import { Title } from "@/components/design_system/structure/title"
import { useUSGRecordContext } from "../usg_record_context"
import { useCollateralPriceContext } from "./collat_price_context"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { Divider } from "@/components/design_system/structure/divider"
import { cn } from "@/lib/utils"
import { UI_V2 } from "@/v2/ui"

const timeWindowsCrv = ["15m", "1h", "6h", "1d", "7d"]
const timeWindowsPendle = ["1h", "1d", "1w"]

export function USGCollateralPrice() {
  const { timeWindow, graphData, oraclePriceData, isPending, marketInfo, selectTab } = useCollateralPriceContext()

  const { liquidationPrice, collateralInfo } = useUSGRecordContext()

  if (UI_V2) {
    const windows = marketInfo.marketType === "Pendle_PT" ? timeWindowsPendle : timeWindowsCrv
    return (
      <section className="w-full">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.01em]">Collateral price</h2>
            <p className="mt-1 text-[13px] text-ink-2">
              Market price of one {collateralInfo?.symbol?.replaceAll("-", "/")} token: market candles, oracle price in blue, your liquidation price in amber.
            </p>
          </div>
          <div role="tablist" className="flex gap-0.5 rounded-lg bg-white/[0.04] p-0.5">
            {windows.map((tw) => (
              <button
                key={tw}
                role="tab"
                aria-selected={timeWindow === tw}
                onClick={() => selectTab(tw)}
                className={cn(
                  "h-7 rounded-md px-2.5 text-xs font-medium tabular-nums transition-colors duration-150",
                  timeWindow === tw ? "bg-white/[0.09] text-white" : "text-ink-3 hover:text-ink-2"
                )}
              >
                {tw}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-hairline bg-surface p-2">
          <CollateralGraph liquidationPrice={liquidationPrice} isPending={isPending} graphData={graphData} oraclePriceData={oraclePriceData} />
        </div>
      </section>
    )
  }

  return (
    <ReliefCard className="hidden w-full flex-col justify-between p-5 xl:flex">
      <div className="flex items-center justify-between">
        <Title label="Collateral price" size={"normal"} />
        <div className="flex gap-2">
          {marketInfo.marketType === "Pendle_PT" ? (
            <>
              {timeWindowsPendle.map((tw) => {
                return <ButtonTab key={tw} onClick={() => selectTab(tw)} label={tw} active={timeWindow === tw} className="rounded-full !py-1" />
              })}
            </>
          ) : (
            <>
              {timeWindowsCrv.map((tw) => {
                return <ButtonTab key={tw} onClick={() => selectTab(tw)} label={tw} active={timeWindow === tw} className="rounded-full !py-1" />
              })}
            </>
          )}
        </div>
      </div>
      <Divider />

      <div className="w-full rounded-[10px]">
        <CollateralGraph liquidationPrice={liquidationPrice} isPending={isPending} graphData={graphData} oraclePriceData={oraclePriceData} />
      </div>
    </ReliefCard>
  )
}
