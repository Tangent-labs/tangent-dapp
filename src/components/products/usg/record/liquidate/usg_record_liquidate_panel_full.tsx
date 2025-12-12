"use client"

import { useUSGRecordContext } from "../usg_record_context"
import Divider from "@/components/design_system/structure/divider"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { USGStaticAssetSelector } from "@/components/design_system/structure/usg_static_selector"
import { CustomCollatAssetDisplay } from "@/components/design_system/structure/custom_collat_asset_display"

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
        <DepositInput
          depositAmount={marketData?.collateralInfos?.positionCollateralAmount}
          labelDeposit="You liquidate"
          depositSelect={<LiquidateAssetDisplay />}
          disabled={true}
          displaySliderInput={false}
          depositAsset={collateralInfo}
          setMaxBalance={() => {}}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
          percentage={0}
          setPercentage={() => {}}
        />

        <DepositInput
          depositAmount={USGReceivedValue}
          labelDeposit="For"
          depositSelect={<USGStaticAssetSelector />}
          disabled={true}
          displaySliderInput={false}
          depositAsset={USGInfo}
          setMaxBalance={() => {}}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
          percentage={0}
          setPercentage={() => {}}
        />

        <Divider />

        <DepositInput
          depositAmount={repayWeiValue}
          labelDeposit="You repay"
          depositSelect={<USGStaticAssetSelector />}
          disabled={true}
          displaySliderInput={false}
          depositAsset={USGInfo}
          setMaxBalance={() => {}}
          onValueChange={() => {}}
          percentage={0}
          setPercentage={() => {}}
        />

        <DepositInput
          depositAmount={(USGReceivedValue || 0n) - (repayWeiValue || 0n)}
          labelDeposit="You receive"
          depositSelect={<USGStaticAssetSelector />}
          disabled={true}
          displaySliderInput={false}
          depositAsset={USGInfo}
          setMaxBalance={() => {}}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
          percentage={0}
          setPercentage={() => {}}
        />
      </div>
    </>
  )
}
