"use client"

import { useUSGRecordContext } from "../usg_record_context"
import Divider from "@/components/design_system/structure/divider"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import { CustomCollatAssetDisplay } from "@/components/design_system/structure/custom_collat_asset_display"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"

export default function USGLiquidatePanelFull() {
  const { USGInfo, collateralInfo, marketData } = useUSGRecordContext()

  const { isQuoteLoading, USGReceivedValue, repayWeiValue } = useUSGLiquidateContext()

  const LiquidateAssetDisplay = () => {
    return <CustomCollatAssetDisplay collateralInfo={collateralInfo} />
  }

  return (
    <>
      <div className="flex w-full items-end justify-between">
        <span className="text-sm font-semibold md:text-xl">Liquidate all</span>
      </div>

      <div className="flex flex-col gap-2">
        <GenericInputAssetAmount
          inputWeiValue={marketData?.collateralInfos?.positionCollateralAmount}
          label="You liquidate"
          depositSelect={<LiquidateAssetDisplay />}
          disabled={true}
          displaySliderInput={false}
          asset={collateralInfo}
          setMaxBalance={() => {}}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
          sliderPercentage={0}
          setSliderPercentage={() => {}}
          sliderLegendValues={PERCENTAGE_INPUT_AMOUNT}
        />

        <GenericInputAssetAmount
          inputWeiValue={USGReceivedValue}
          label="For"
          depositSelect={<StaticCardAssetInput asset="USG" />}
          disabled={true}
          displaySliderInput={false}
          asset={USGInfo}
          setMaxBalance={() => {}}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
          sliderPercentage={0}
          setSliderPercentage={() => {}}
          sliderLegendValues={PERCENTAGE_INPUT_AMOUNT}
        />

        <Divider />

        <GenericInputAssetAmount
          inputWeiValue={repayWeiValue}
          label="You repay"
          depositSelect={<StaticCardAssetInput asset="USG" />}
          disabled={true}
          displaySliderInput={false}
          asset={USGInfo}
          setMaxBalance={() => {}}
          onValueChange={() => {}}
          sliderPercentage={0}
          setSliderPercentage={() => {}}
          sliderLegendValues={PERCENTAGE_INPUT_AMOUNT}
        />

        <GenericInputAssetAmount
          inputWeiValue={(USGReceivedValue || 0n) - (repayWeiValue || 0n)}
          label="You receive"
          depositSelect={<StaticCardAssetInput asset="USG" />}
          disabled={true}
          displaySliderInput={false}
          asset={USGInfo}
          setMaxBalance={() => {}}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
          sliderPercentage={0}
          setSliderPercentage={() => {}}
          sliderLegendValues={PERCENTAGE_INPUT_AMOUNT}
        />
      </div>
    </>
  )
}
