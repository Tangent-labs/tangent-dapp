"use client"

import UsgTotalBorrow from "./usg_total_borrow"
import { formatCompact } from "@/lib/number_formatter"
import { InterestRateGraph } from "./usg_interest_rate_graph"
import { useUSGRecordContext } from "./usg_record_context"
import { Title } from "@/components/design_system/structure/title"
import { Divider } from "@/components/design_system/structure/divider"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

export function USGMarketInfo() {
  const { totalBorrow, totalBorrowTimeWindow, setTotalBorrowTimeWindow } = useUSGRecordContext()

  return (
    <>
      <ReliefCard className="mt-4 px-4 py-2">
        <Title label="Markets info" size="normal" />
        <Divider />
        <div className="flex flex-col justify-between xl:flex-row">
          <div className="flex flex-1 items-center justify-between border-r border-r-white border-opacity-10 pr-3">
            <div className="flex w-full flex-col">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center justify-center gap-1 text-base text-white">
                  <span>Total borrow:</span>
                  <span className="font-semibold">${formatCompact(totalBorrow?.latestTotalDebt)}</span>
                </div>
                <div className="flex gap-2">
                  <ButtonTab
                    onClick={() => setTotalBorrowTimeWindow("1w")}
                    label={"1w"}
                    active={totalBorrowTimeWindow === "1w"}
                    className="rounded-full !py-1"
                  />
                  <ButtonTab
                    onClick={() => setTotalBorrowTimeWindow("1m")}
                    label={"1m"}
                    active={totalBorrowTimeWindow === "1m"}
                    className="rounded-full !py-1"
                  />
                  <ButtonTab
                    onClick={() => setTotalBorrowTimeWindow("1y")}
                    label={"1y"}
                    active={totalBorrowTimeWindow === "1y"}
                    className="rounded-full !py-1"
                  />
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
              Interest rate model
              <InterestRateGraph />
            </div>
          </div>
        </div>
      </ReliefCard>
    </>
  )
}
