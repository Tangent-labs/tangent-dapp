"use client"

import Divider from "@/components/design_system/structure/divider"
import Title from "@/components/design_system/structure/title"
import UsgTotalBorrow from "./usg_total_borrow"
import InterestRateGraph from "./tg_usd_interest_rate_graph"
import { useUSGRecordContext } from "./tg_usd_record_context"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { formatCompact } from "@/lib/number_formatter"

export default function USGMarketInfo() {
  const { totalBorrow, totalBorrowTimeWindow, setTotalBorrowTimeWindow } = useUSGRecordContext()

  return (
    <div className="rounded-[10px] bg-overlay-panel px-4 py-2 backdrop-blur-[60px]">
      <Title label={"Markets info"} size={"normal"} />
      <Divider />
      <div className="flex flex-col justify-between xl:flex-row">
        <div className="flex flex-1 items-center justify-between border-r border-r-white border-opacity-20 pr-3">
          <div className="flex w-full flex-col">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center justify-center gap-2">
                <span>Total borrow</span>
                <span className="bg-button-active bg-clip-text text-xl font-semibold text-transparent">${formatCompact(totalBorrow?.latestTotalDebt)}</span>
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
            <div className="flex h-[300px] w-full border-0 p-4">
              <UsgTotalBorrow totalBorrow={totalBorrow?.data} />
            </div>
          </div>
        </div>

        <div className="ml-3 flex flex-1 items-center justify-between">
          <div className="flex w-full flex-col">
            <div className="flex w-full gap-2">
              <span>Interest rate model</span>
            </div>
            <div className="flex h-[300px] w-full border-0 p-4">
              <InterestRateGraph />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
