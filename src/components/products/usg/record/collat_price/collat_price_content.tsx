"use client"

import { CollateralGraph } from "../usg_collateral_price"
import { Title } from "@/components/design_system/structure/title"
import { useUSGRecordContext } from "../usg_record_context"
import { useCollateralPriceContext } from "./collat_price_context"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

const timeWindowsCrv = ["15m", "1h", "6h", "1d", "7d"]
const timeWindowsPendle = ["1h", "1d", "1w"]

export function USGCollateralPrice() {
  const { timeWindow, graphData, oraclePriceData, isPending, marketInfo, selectTab } = useCollateralPriceContext()

  const { liquidationPrice } = useUSGRecordContext()

  return (
    <ReliefCard className="hidden w-full flex-col justify-between p-5 xl:flex">
      <div className="mb-2 flex items-center justify-between">
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

      <div className="w-full rounded-[10px]">
        <CollateralGraph liquidationPrice={liquidationPrice} isPending={isPending} graphData={graphData} oraclePriceData={oraclePriceData} />
      </div>
    </ReliefCard>
  )
}
