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
    <ReliefCard className="p-5">
      <div className="flex flex-col gap-[10px] xl:flex-row">
        <div className="flex w-1/2 flex-col">
          <div className="flex items-center text-base text-white">Interest rate model</div>
          <div className="mt-5 h-[280px] w-full">
            <InterestRateGraph />
          </div>
        </div>

        <div className="flex w-1/2 flex-col border-l border-l-white border-opacity-10 pl-[10px]">
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
          <div className="mt-4 h-[280px] w-full">
            <UsgTotalBorrow totalBorrow={totalBorrow?.data} />
          </div>
        </div>
      </div>
    </ReliefCard>
  )
}
