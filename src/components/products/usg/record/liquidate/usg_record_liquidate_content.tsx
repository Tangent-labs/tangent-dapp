"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { Divider } from "@/components/design_system/structure/divider"
import FormButtons from "@/components/design_system/form/form_actions"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { RecapAccordion } from "@/components/design_system/structure/recap"
import { SlippageAlert } from "@/components/design_system/inputs/slippage_alert"
import { PriceImpactAlert } from "@/components/design_system/inputs/price_impact_alert"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"

export default function USGLiquidatePanel() {
  const { canInteract } = useWalletConnexionContext()

  const { USGInfo, collateralInfo, isTxLoading } = useUSGRecordContext()

  const { actionLiquidate, formState, slippage, setSlippage } = useUSGLiquidateContext()

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
    priceImpact,
    priceImpactLoss,
    zapValuesFormatted,
    setIsTransactionBlockedByPriceImpact,
    isTransactionBlockedByPriceImpact,
    isTransactionBlockedBySlippage,
    setIsTransactionBlockedBySlippage,
    slippageLoss,
  } = useUSGLiquidateContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex w-full items-end justify-between">
          <span className="text-sm font-semibold md:text-xl">Liquidate</span>
          <span className="text-xs text-subtitle">{maxLiquidateString}</span>
        </div>

        <GenericInputAssetAmount
          inputWeiValue={liquidateWeiValue}
          label="You liquidate"
          depositSelect={<StaticCardAssetInput assetName={collateralInfo.name} logoKey={collateralInfo.logoKey} />}
          slippageInput={<SlippageInput slippage={slippage} setSlippage={setSlippage} />}
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
          <span className="text-xs text-subtitle">Max: {formatBigInt(maxRepayable, 18, 2)} USG</span>
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

      <RecapAccordion
        isLoading={isQuoteLoading}
        isDisplayed={true}
        zappingParams={{
          label: "remaining collateral",
          expected: `${zapValuesFormatted.expectedFormatted} ${collateralInfo.symbol}`,
          slippage: slippage,
          liquidateMinOut: `${zapValuesFormatted?.minOutFormatted} USG`,
        }}
      />

      {!!liquidateWeiValue && slippage >= 1 && (
        <SlippageAlert
          symbol={collateralInfo?.symbol as string}
          tokenLoss={slippageLoss?.tokenLoss}
          dollarLoss={slippageLoss?.dollarLoss}
          slippage={slippage}
          isLoading={isQuoteLoading}
          displayConfirmationButton={isTransactionBlockedBySlippage}
          onClickContinue={() => setIsTransactionBlockedBySlippage(false)}
        />
      )}

      {!!liquidateWeiValue && priceImpact >= 1 && (
        <PriceImpactAlert
          dollarLoss={priceImpactLoss}
          priceImpact={priceImpact}
          isLoading={isQuoteLoading}
          displayConfirmationButton={isTransactionBlockedByPriceImpact}
          onClickContinue={() => setIsTransactionBlockedByPriceImpact(false)}
        />
      )}

      <FormButtons
        isLoading={isTxLoading || isQuoteLoading}
        actions={{ handleApprove: undefined, handleProcess: actionLiquidate }}
        formState={formState}
        labelProcess="Liquidate"
      />
    </div>
  )
}
