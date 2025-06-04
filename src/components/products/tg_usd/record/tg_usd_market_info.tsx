"use client"

import Divider from "@/components/design_system/structure/divider"
import Title from "@/components/design_system/structure/title"
import BorrowHistoryGraph from "./tg_usd_borrow_graph"
import InterestRateGraph from "./tg_usd_interest_rate_graph"

type TgUsdMarketInfoProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default function TgUsdMarketInfo({ ...props }: TgUsdMarketInfoProps) {
  return (
    <div className="rounded-[10px] bg-overlay-panel px-4 py-2 backdrop-blur-[60px]" {...props}>
      <Title label={"Markets info"} size={"normal"} />
      <Divider />
      <div className="flex justify-between gap-4">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex w-full flex-col">
            <div className="flex w-full gap-2">
              <span>Total borrow</span>
              <span className="text-lg text-row-tonic">$230,99M</span>
            </div>
            <div className="flex h-[300px] w-full border-0 p-4">
              <BorrowHistoryGraph />
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between">
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
