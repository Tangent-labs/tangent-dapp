"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import Divider from "@/components/design_system/structure/divider"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { CustomCollatAssetDisplay } from "@/components/design_system/structure/custom_collat_asset_display"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"

export default function USGLiquidatePanelPartial() {
  const { USGInfo, collateralInfo, pricedCollateralInfo } = useUSGRecordContext()

  const { canInteract } = useWalletConnexionContext()

  const {
    setRepayWeiValue,
    setLiquidablePercentage,
    handleLiquidateValueChange,
    setRepayablePercentage,
    liquidateWeiValue,
    maxLiquidable,
    liquidablePercentage,
    isQuoteLoading,
    USGReceivedValue,
    repayWeiValue,
    repayablePercentage,
    maxRepayable,
    maxLiquidateString,
  } = useUSGLiquidateContext()

  const LiquidateAssetDisplay = () => {
    return <CustomCollatAssetDisplay collateralInfo={collateralInfo} />
  }

  return (
    <>
      <div className="flex w-full items-end justify-between">
        <span className="text-sm font-semibold md:text-xl">Liquidate partial</span>
        <span className="text-xs text-subtitle">{maxLiquidateString}</span>
      </div>

      <GenericInputAssetAmount
        inputWeiValue={liquidateWeiValue}
        label="You liquidate"
        depositSelect={<LiquidateAssetDisplay />}
        disabled={!canInteract}
        displaySliderInput={true}
        sliderPercentage={liquidablePercentage}
        setSliderPercentage={setLiquidablePercentage}
        asset={pricedCollateralInfo}
        setMaxAmount={() => handleLiquidateValueChange(maxLiquidable)}
        balance={maxLiquidable}
        onValueChange={handleLiquidateValueChange}
        sliderLegendValues={PERCENTAGE_INPUT_AMOUNT}
      />

      <GenericInputAssetAmount
        inputWeiValue={USGReceivedValue}
        label="For"
        depositSelect={<StaticCardAssetInput asset="USG" />}
        disabled={true}
        displaySliderInput={false}
        asset={USGInfo}
        setMaxAmount={() => {}}
        onValueChange={() => {}}
        isLoading={isQuoteLoading}
        sliderPercentage={0}
        setSliderPercentage={() => {}}
        sliderLegendValues={PERCENTAGE_INPUT_AMOUNT}
      />

      <Divider />

      <div className="flex w-full items-end justify-end">
        <span className="text-xs text-subtitle">Max: {formatBigInt(maxRepayable, 18, 2)} USG</span>
      </div>

      <GenericInputAssetAmount
        inputWeiValue={repayWeiValue}
        label="You repay"
        depositSelect={<StaticCardAssetInput asset="USG" />}
        disabled={!canInteract}
        displaySliderInput={true}
        sliderPercentage={repayablePercentage}
        setSliderPercentage={setRepayablePercentage}
        asset={USGInfo}
        setMaxAmount={() => setRepayWeiValue(maxRepayable)}
        balance={maxRepayable}
        onValueChange={(value: bigint | undefined) => {
          setRepayWeiValue(value)
        }}
        sliderLegendValues={PERCENTAGE_INPUT_AMOUNT}
      />

      <GenericInputAssetAmount
        inputWeiValue={(USGReceivedValue || 0n) - (repayWeiValue || 0n)}
        label="You receive"
        depositSelect={<StaticCardAssetInput asset="USG" />}
        disabled={true}
        displaySliderInput={false}
        asset={USGInfo}
        setMaxAmount={() => {}}
        onValueChange={() => {}}
        isLoading={isQuoteLoading}
      />
    </>
  )
}
