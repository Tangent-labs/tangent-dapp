"use client"

import UsgTotalBorrow from "./usg_total_borrow"
import { formatMillions } from "@/lib/number_formatter"
import { InterestRateGraph } from "./usg_interest_rate_graph"
import { useUSGRecordContext } from "./usg_record_context"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { UI_V2 } from "@/v2/ui"

const RANGES = ["1w", "1m", "1y", "all"]

export function USGMarketInfo() {
  const { totalBorrow, totalBorrowTimeWindow, setTotalBorrowTimeWindow } = useUSGRecordContext()

  if (UI_V2)
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReliefCard className="p-5">
          <div className="text-[15px] font-semibold">Interest rate model</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-action" /> Rewards cut (left)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white" /> Interest rate (right)
            </span>
            <span className="text-ink-3">X axis: USG price</span>
          </div>
          <div className="mt-4 h-[260px] w-full">
            <InterestRateGraph />
          </div>
        </ReliefCard>
        <ReliefCard className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold">Total borrow</div>
              <div className="mt-1 text-[22px] font-light tabular-nums tracking-[-0.02em]">${formatMillions(totalBorrow?.latestTotalDebt)}</div>
            </div>
            <div role="tablist" className="flex gap-0.5 rounded-lg bg-white/[0.04] p-0.5">
              {RANGES.map((r) => (
                <ButtonTab key={r} onClick={() => setTotalBorrowTimeWindow(r)} label={r} active={totalBorrowTimeWindow === r} />
              ))}
            </div>
          </div>
          <div className="mt-2 h-[236px] w-full">
            <UsgTotalBorrow totalBorrow={totalBorrow?.data} />
          </div>
        </ReliefCard>
      </div>
    )

  return (
    <ReliefCard className="px-5 pt-5">
      <div className="flex flex-col md:flex-row">
        <div className="flex w-1/2 flex-col pr-5">
          <div className="flex items-center text-base text-white">Interest rate model</div>
          <div className="mt-5 h-[260px] w-full">
            <InterestRateGraph />
          </div>
        </div>

        <div className="mb-5 w-[1px] self-stretch bg-white/10"></div>

        <div className="flex w-1/2 flex-col pl-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-base text-white">
              Total borrow:
              <span className="font-semibold">${formatMillions(totalBorrow?.latestTotalDebt)}</span>
            </div>
            <div className="flex gap-2">
              <ButtonTab onClick={() => setTotalBorrowTimeWindow("1w")} label={"1w"} active={totalBorrowTimeWindow === "1w"} className="rounded-full !py-1" />
              <ButtonTab onClick={() => setTotalBorrowTimeWindow("1m")} label={"1m"} active={totalBorrowTimeWindow === "1m"} className="rounded-full !py-1" />
              <ButtonTab onClick={() => setTotalBorrowTimeWindow("1y")} label={"1y"} active={totalBorrowTimeWindow === "1y"} className="rounded-full !py-1" />
              <ButtonTab
                onClick={() => setTotalBorrowTimeWindow("all")}
                label={"all"}
                active={totalBorrowTimeWindow === "all"}
                className="rounded-full !py-1"
              />
            </div>
          </div>
          <div className="mt-4 h-[260px] w-full">
            <UsgTotalBorrow totalBorrow={totalBorrow?.data} />
          </div>
        </div>
      </div>
    </ReliefCard>
  )
}
