"use client"

import { useUSGRecordContext } from "../usg_record_context"
import Divider from "@/components/design_system/structure/divider"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { ExistingAsset } from "@/types"

export default function USGLiquidatePanelFull() {
  const { USGInfo, collateralInfo, marketData } = useUSGRecordContext()

  const { isQuoteLoading, USGReceivedValue, repayWeiValue } = useUSGLiquidateContext()

  return (
    <>
      <div className="flex w-full items-end justify-between">
        <span className="text-sm font-semibold md:text-xl">Liquidate all</span>
      </div>

      <div className="flex flex-col gap-2">
        <GenericInputAssetAmount
          inputWeiValue={marketData?.collateralInfos?.positionCollateralAmount}
          label="You liquidate"
          depositSelect={<StaticCardAssetInput asset={collateralInfo.name as ExistingAsset} />}
          disabled={true}
          asset={collateralInfo}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
        />

        <GenericInputAssetAmount
          inputWeiValue={USGReceivedValue}
          label="For"
          depositSelect={<StaticCardAssetInput asset="USG" />}
          disabled={true}
          asset={USGInfo}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
        />

        <Divider />

        <GenericInputAssetAmount
          inputWeiValue={repayWeiValue}
          label="You repay"
          depositSelect={<StaticCardAssetInput asset="USG" />}
          disabled={true}
          asset={USGInfo}
          onValueChange={() => {}}
        />

        <GenericInputAssetAmount
          inputWeiValue={(USGReceivedValue || 0n) - (repayWeiValue || 0n)}
          label="You receive"
          depositSelect={<StaticCardAssetInput asset="USG" />}
          disabled={true}
          asset={USGInfo}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
        />
      </div>
    </>
  )
}
