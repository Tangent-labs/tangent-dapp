"use client"

import { formatEther } from "viem"
import { MarketDebtData, USGCollateralData } from "@/components/products/usg/usg_type"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { InnerTooltip } from "@/components/design_system/structure/inner_tooltip"
import { formatMillions } from "@/lib/number_formatter"
import { ChartHeadV2 } from "@/v2/ui/chart"

type Props = {
  collaterals: USGCollateralData[] | undefined
  marketDebtData: MarketDebtData[] | undefined
  marketTVLMaxValue: number
}

/**
 * V2 "USG collaterals & debt": a ranked list in columns (market, bar, share), same numbers as the live card.
 * Same logic as the live GraphCollateralsAndDebts: markets with value > 0, bar width = value / marketTVLMaxValue (TVL, light),
 * solid part = debt / rawValue (its getDebtRatio), same TVL and Debt tooltip, same order.
 * While the data loads it keeps its place with a skeleton, so the page does not jump.
 */
export function CollateralsDebtV2({ collaterals, marketDebtData, marketTVLMaxValue }: Props) {
  const loading = !collaterals
  const rows = (collaterals ?? []).filter((el) => el.value > 0)
  const debtByMarket = new Map<string, bigint>((marketDebtData ?? []).map((el) => [el.marketAddress, el.rawValue]))

  return (
    <div className="flex h-[420px] w-full flex-col rounded-2xl border border-hairline bg-surface p-5 lg:max-w-[50%]">
      {loading ? (
        <div>
          <div className="text-[13px] font-medium text-ink-2">USG collaterals & debt</div>
          <div className="v2-shimmer mt-2 h-7 w-28 rounded-md" />
        </div>
      ) : (
        <ChartHeadV2 label="USG collaterals & debt" value={`${rows.length} markets`} />
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "rgba(0, 117, 255, 0.5)" }} /> TVL
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "rgba(0, 117, 255, 1)" }} /> Debt
        </span>
      </div>

      <div className="v2-scroll -mx-2 mt-4 min-h-0 flex-1 overflow-y-auto px-2 pb-6 [mask-image:linear-gradient(to_bottom,black_82%,transparent)]">
        {loading &&
          Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="grid h-9 grid-cols-[150px_minmax(0,1fr)_56px] items-center gap-3">
              <span className="v2-shimmer h-3 w-24 rounded" />
              <span className="v2-shimmer h-2 rounded-full" style={{ width: `${90 - i * 9}%` }} />
              <span className="v2-shimmer ml-auto h-3 w-9 rounded" />
            </div>
          ))}

        {rows.map((data) => {
          const debt = debtByMarket.get(data.marketAddress) ?? 0n
          const ratio = data.rawValue > 0n ? Number(formatEther(debt)) / Number(formatEther(data.rawValue)) : 0
          const width = marketTVLMaxValue > 0 ? Math.min(1, data.value / marketTVLMaxValue) : 0
          return (
            <InnerTooltip
              key={data.marketAddress}
              innerContent={
                <div className="flex min-w-36 flex-col gap-1">
                  <div className="mb-1 text-[11px] text-ink-3">{data.name?.replaceAll("-", "/")}</div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-ink-2">TVL</span>
                    <span className="font-medium tabular-nums text-white">${formatMillions(formatEther(data.rawValue))}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-ink-2">Debt</span>
                    <span className="font-medium tabular-nums text-white">{formatMillions(formatEther(debt))} USG</span>
                  </div>
                </div>
              }
            >
              <div className="grid h-9 cursor-default grid-cols-[150px_minmax(0,1fr)_56px] items-center gap-3 rounded-[8px] px-2 transition-colors hover:bg-white/[0.035]">
                <span className="flex min-w-0 items-center gap-2 text-[13px]">
                  <TokenImage token={data.logoKey} size={16} className="h-4 w-auto shrink-0" />
                  <span className="truncate">{data.name?.replaceAll("-", "/")}</span>
                </span>
                <span className="relative h-2 w-full">
                  <span
                    className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
                    style={{ width: `${width * 100}%`, backgroundColor: "rgba(0, 117, 255, 0.5)" }}
                  >
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${ratio * 100}%`, backgroundColor: "rgba(0, 117, 255, 1)" }} />
                  </span>
                </span>
                <span className="text-right text-[13px] font-medium tabular-nums">{data.value}%</span>
              </div>
            </InnerTooltip>
          )
        })}
      </div>
    </div>
  )
}
