"use client"

import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { useUSGRecordContext } from "../usg_record_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { Divider } from "@/components/design_system/structure/divider"
import { formatBigInt } from "@/lib/number_formatter"
import FormButtons from "@/components/design_system/form/form_actions"

export default function USGLiquidatePanel() {
  const { connect } = useWalletConnexionContext()

  const { canInteract } = useWalletConnexionContext()

  const { USGInfo, collateralInfo } = useUSGRecordContext()

  const { actionLiquidate, formState } = useUSGLiquidateContext()

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
    isLiquidationLoading,
  } = useUSGLiquidateContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex w-full items-end justify-between">
          <span className="text-sm font-semibold md:text-xl">Liquidate </span>
          <span className="text-xs text-subtitle">{maxLiquidateString}</span>
        </div>

        <GenericInputAssetAmount
          inputWeiValue={liquidateWeiValue}
          label="You liquidate"
          depositSelect={<StaticCardAssetInput assetName={collateralInfo.name} logoKey={collateralInfo.logoKey} />}
          disabled={!canInteract}
          asset={collateralInfo}
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
          depositSelect={<StaticCardAssetInput assetName="USG" logoKey="USG" />}
          disabled={true}
          asset={USGInfo}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
        />

        <Divider />

        <div className="flex w-full items-end justify-between">
          <span className="text-sm font-semibold md:text-xl">Repay </span>
          <span className="text-xs text-subtitle">Max: {formatBigInt(maxRepayable, 18, 2)} USG</span>{" "}
        </div>

        <GenericInputAssetAmount
          inputWeiValue={repayWeiValue}
          label="You repay"
          depositSelect={<StaticCardAssetInput assetName="USG" logoKey="USG" />}
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
          depositSelect={<StaticCardAssetInput assetName="USG" logoKey="USG" />}
          disabled={true}
          asset={USGInfo}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
        />
      </div>

      <FormButtons
        isLoading={isLiquidationLoading}
        connect={connect}
        actions={{ handleApprove: undefined, handleProcess: actionLiquidate }}
        formState={formState}
        labelProcess="Liquidate"
      />
    </div>
  )
}
