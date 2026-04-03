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
import { WalletRepayAlert } from "@/components/design_system/inputs/wallet_repay_alert"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { FormAlert } from "@/components/design_system/inputs/form_alert"

export default function USGLiquidatePanel() {
  const { connect } = useWalletConnexionContext()

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
    walletRepayValue,
    collateralRepayValue,
    isTransactionBlockedByWalletRepay,
    setIsTransactionBlockedByWalletRepay,
  } = useUSGLiquidateContext()

  const netReceivedValue = (USGReceivedValue || 0n) - (repayWeiValue || 0n)
  const isWalletRepayNet = netReceivedValue < 0n

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
          inputWeiValue={isWalletRepayNet ? walletRepayValue : netReceivedValue}
          label={isWalletRepayNet ? "You repay from wallet" : "You receive"}
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
          label: "USG",
          expected: `${zapValuesFormatted.expectedFormatted} ${collateralInfo.symbol}`,
          slippage: slippage,
          liquidateMinOut: `${zapValuesFormatted?.minOutFormatted} USG`,
          priceImpact: priceImpact,
          usgRepaidFromCollateral: `${formatBigInt(collateralRepayValue, 18, 2)} USG`,
          usgRepaidFromWallet: `${formatBigInt(walletRepayValue, 18, 2)} USG`,
        }}
      />

      {formState.errors
        .filter((e) => e.type === "form-alert")
        .map((error) => (
          <FormAlert key={error.key} error={error} className="my-1" isLoading={isQuoteLoading} />
        ))}

      {!!liquidateWeiValue && !isQuoteLoading && slippage >= 1 && (
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

      {!!liquidateWeiValue && priceImpact >= 0.25 && (
        <PriceImpactAlert
          dollarLoss={priceImpactLoss}
          priceImpact={priceImpact}
          isLoading={isQuoteLoading}
          displayConfirmationButton={isTransactionBlockedByPriceImpact}
          onClickContinue={() => setIsTransactionBlockedByPriceImpact(false)}
        />
      )}

      {!!repayWeiValue && !isQuoteLoading && walletRepayValue > 0n && (
        <WalletRepayAlert
          confirmationButtonLabel="I understand"
          displayConfirmationButton={isTransactionBlockedByWalletRepay}
          walletRepay={`${formatBigInt(walletRepayValue, 18, 2)} USG`}
          isLoading={isQuoteLoading}
          onClickContinue={() => setIsTransactionBlockedByWalletRepay(false)}
        />
      )}

      <FormButtons
        isLoading={isTxLoading || isQuoteLoading}
        connect={connect}
        actions={{ handleApprove: undefined, handleProcess: actionLiquidate }}
        formState={formState}
        labelProcess="Liquidate"
      />
    </div>
  )
}
