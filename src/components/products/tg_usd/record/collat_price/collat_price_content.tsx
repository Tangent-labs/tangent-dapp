"use client"

import { CollateralGraph } from "../tg_usd_collateral_price"
import Title from "@/components/design_system/structure/title"
import { useUSGRecordContext } from "../tg_usd_record_context"
import Divider from "@/components/design_system/structure/divider"
import { useCollateralPriceContext } from "./collat_price_context"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import TokenImage from "@/components/design_system/structure/token_image"

export default function USGCollateralPrice() {
  const { collateralInfo, timeWindow, graphData, isPending, marketInfo, selectTab } = useCollateralPriceContext()

  const { liquidationPrice } = useUSGRecordContext()

  return (
    <div className="hidden w-full flex-col justify-between rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px] xl:flex">
      <Title label="Collateral price" size={"normal"} />
      <Divider />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1">
          <TokenImage token={collateralInfo?.logo} size={32} />
          <span>{collateralInfo.symbol}</span>
        </div>

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

      {graphData && (
        <div className="w-full rounded-[10px]">
          <CollateralGraph liquidationPrice={liquidationPrice} isPending={isPending} graphData={graphData} />
        </div>
      )}
    </div>
  )
}
