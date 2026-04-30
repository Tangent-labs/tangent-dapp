"use client"

import UsgTotalBorrow from "./usg_total_borrow"
import { formatCompact } from "@/lib/number_formatter"
import { InterestRateGraph } from "./usg_interest_rate_graph"
import { useUSGRecordContext } from "./usg_record_context"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

export function USGMarketInfo() {
  const { totalBorrow, totalBorrowTimeWindow, setTotalBorrowTimeWindow } = useUSGRecordContext()

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
              <span className="font-semibold">${formatCompact(totalBorrow?.latestTotalDebt)}</span>
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
