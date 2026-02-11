"use client"

import { CollateralGraph } from "../usg_collateral_price"
import Title from "@/components/design_system/structure/title"
import { useUSGRecordContext } from "../usg_record_context"
import { useCollateralPriceContext } from "./collat_price_context"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

export default function USGCollateralPrice() {
  const { timeWindow, graphData, isPending, marketInfo, selectTab } = useCollateralPriceContext()

  const { liquidationPrice } = useUSGRecordContext()

  return (
    <ReliefCard className="hidden w-full flex-col justify-between rounded-[10px] bg-overlay-panel px-3 py-2 backdrop-blur-[60px] xl:flex">
      <div className="mb-2 flex items-center justify-between">
        <Title label="Collateral price" size={"normal"} />
        <div className="flex gap-2">
          {marketInfo.marketType === "Pendle_PT" ? (
            <>
              <ButtonTab onClick={() => selectTab("1h")} label={"1h"} active={timeWindow === "1h"} className="rounded-full !py-1" />
              <ButtonTab onClick={() => selectTab("1d")} label={"1d"} active={timeWindow === "1d"} className="rounded-full !py-1" />
              <ButtonTab onClick={() => selectTab("1w")} label={"1w"} active={timeWindow === "1w"} className="rounded-full !py-1" />
            </>
          ) : (
            <>
              <ButtonTab onClick={() => selectTab("15m")} label={"15m"} active={timeWindow === "15m"} className="rounded-full !py-1" />
              <ButtonTab onClick={() => selectTab("1h")} label={"1h"} active={timeWindow === "1h"} className="rounded-full !py-1" />
              <ButtonTab onClick={() => selectTab("6h")} label={"6h"} active={timeWindow === "6h"} className="rounded-full !py-1" />
              <ButtonTab onClick={() => selectTab("1d")} label={"1d"} active={timeWindow === "1d"} className="rounded-full !py-1" />
              <ButtonTab onClick={() => selectTab("7d")} label={"7d"} active={timeWindow === "7d"} className="rounded-full !py-1" />
            </>
          )}
        </div>
      </div>

      <div className="w-full rounded-[10px]">
        <CollateralGraph liquidationPrice={liquidationPrice} isPending={isPending} graphData={graphData} />
      </div>
    </ReliefCard>
  )
}
