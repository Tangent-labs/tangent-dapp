"use client"

import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import TokenImage from "@/components/design_system/structure/token_image"
import Divider from "@/components/design_system/structure/divider"
import { useUSGRecordContext } from "../usg_record_context"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import { USGStaticAssetSelector } from "@/components/design_system/structure/usg_static_selector"

export default function USGLiquidatePanelFull() {
  const { USGInfo, collateralInfo, marketData } = useUSGRecordContext()

  const { isQuoteLoading, USGReceivedValue, repayWeiValue } = useUSGLiquidateContext()

  const LiquidateAssetDisplay = () => {
    return (
      <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
        <TokenImage token={collateralInfo?.logo} size={32} />

        <span className="flex flex-col text-sm font-semibold">
          <span>{collateralInfo.symbol}</span>
        </span>
      </BorderPanel>
    )
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
