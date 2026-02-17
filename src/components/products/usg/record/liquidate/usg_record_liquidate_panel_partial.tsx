"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import Divider from "@/components/design_system/structure/divider"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { CustomCollatAssetDisplay } from "@/components/design_system/structure/custom_collat_asset_display"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"

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
        asset={pricedCollateralInfo}
        onValueChange={handleLiquidateValueChange}
        maxAmountParams={{ maxWeiValue: maxLiquidable, setMaxAmount: () => handleLiquidateValueChange(maxLiquidable) }}
        sliderParams={{
          sliderPercentage: liquidablePercentage,
          setSliderPercentage: setLiquidablePercentage,
        }}
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

      <div className="flex w-full items-end justify-end">
        <span className="text-xs text-subtitle">Max: {formatBigInt(maxRepayable, 18, 2)} USG</span>
      </div>

      <GenericInputAssetAmount
        inputWeiValue={repayWeiValue}
        label="You repay"
        depositSelect={<StaticCardAssetInput asset="USG" />}
        disabled={!canInteract}
        asset={USGInfo}
        onValueChange={(value: bigint | undefined) => {
          setRepayWeiValue(value)
        }}
        maxAmountParams={{ maxWeiValue: maxRepayable, setMaxAmount: () => setRepayWeiValue(maxRepayable) }}
        sliderParams={{
          sliderPercentage: repayablePercentage,
          setSliderPercentage: setRepayablePercentage,
        }}
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
    </>
  )
}
