"use client"

import { formatDollar } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGLeverageContext } from "./usg_record_leverage_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { RecapAccordion } from "@/components/design_system/structure/recap"
import { SlippageAlert } from "@/components/design_system/inputs/slippage_alert"
import { ZapAssetSelector } from "@/components/design_system/inputs/asset_selector"
import { PriceImpactAlert } from "@/components/design_system/inputs/price_impact_alert"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { FormAlert } from "@/components/design_system/inputs/form_alert"

export default function USGLeverageContent() {
  const {
    setDepositAsset,
    actionApprove,
    handleDepositChange,
    setSlippage,
    handleZapInputChange,
    setDepositSliderPercent,
    actionLeverage,
    handleBorrowChange,
    actionZapLeverage,
    handleLeverageSliderChange,
    setIsTransactionBlockedBySlippage,
    setIsTransactionBlockedByPriceImpact,
    depositAsset,
    depositWeiValue,
    formState,
    isZapLoading,
    isDepositLoading,
    isDumpUSGLoading,
    zapValue,
    depositAssetInfo,
    borrowWeiValue,
    leveragedCollateralQuote,
    slippage,
    zapValuesFormatted,
    usgDumpValuesFormatted,
    swapValuesFormatted,
    depositSliderPercent,
    leveragePercentage,
    maxDepositString,
    isZapping,
    leverageRange,
    slippageLoss,
    priceImpact,
    priceImpactLoss,
    isTransactionBlockedBySlippage,
    isTransactionBlockedByPriceImpact,
    USGDumpPriceImpact,
    USGDumpDollarLoss,
  } = useUSGLeverageContext()

  const { connect } = useWalletConnexionContext()

  const { collateralInfo, marketData, balanceAllowanceData, USGInfo, maxBorrowCapReached, isTxLoading } = useUSGRecordContext()

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex w-full items-center justify-between gap-2">
        <span className="text-sm font-semibold md:text-xl">Deposit {collateralInfo?.symbol?.replaceAll("-", "/")}</span>
        <span className="text-xs text-subtitle">{maxDepositString}</span>
      </div>

      <GenericInputAssetAmount
        inputWeiValue={depositWeiValue}
        onValueChange={handleDepositChange}
        depositSelect={
          <ZapAssetSelector
            collateralInfo={collateralInfo!}
            depositAsset={depositAsset || collateralInfo!.name}
            setDepositAsset={setDepositAsset}
            caseType="deposit"
          />
        }
        isLoading={isDepositLoading}
        asset={depositAssetInfo}
        label={isZapping ? "You sell" : "You deposit"}
        isZapping={isZapping}
        slippageInput={<SlippageInput slippage={slippage} setSlippage={setSlippage} />}
        maxAmountParams={{
          maxWeiValue: (!!depositAssetInfo ? balanceAllowanceData?.balance : marketData?.collateralBalance) || 0n,
          setMaxAmount: () => {
            handleDepositChange(marketData?.collateralBalance || 0n)
          },
        }}
        sliderParams={{
          sliderPercentage: depositSliderPercent,
          setSliderPercentage: setDepositSliderPercent,
        }}
      />

      {depositAsset && isZapping && (
        <GenericInputAssetAmount
          inputWeiValue={zapValue || 0n}
          onValueChange={(e) => handleZapInputChange(e)}
          asset={collateralInfo}
          isLoading={isZapLoading}
          label={isZapping ? "You buy and deposit" : "You deposit"}
          depositSelect={<StaticCardAssetInput assetName={collateralInfo!.name} logoKey={collateralInfo!.logoKey} />}
          bottomPart={<div className="flex select-none gap-2 text-xs text-subtitle">Minimum received {zapValuesFormatted.minOutFormatted}</div>}
        />
      )}

      <div className="flex flex-col gap-2">
        <div className="flex w-full items-end justify-between gap-1">
          <span className="flex items-start justify-start text-sm font-semibold md:text-xl">Borrow USG</span>

          <div className="flex items-end justify-end text-xs text-subtitle">{`Max leverage: x${leverageRange.maxLeverageAdjusted}`}</div>
        </div>

        <GenericInputAssetAmount
          inputWeiValue={borrowWeiValue}
          onValueChange={(e) => handleBorrowChange(e)}
          depositSelect={<StaticCardAssetInput assetName="USG" logoKey="USG" />}
          label="You borrow and sell"
          asset={USGInfo}
          isLoading={isZapLoading}
          maxAmountParams={{
            maxWeiValue: 0n,
            setMaxAmount: () => {
              handleLeverageSliderChange(leverageRange.maxLeverageAdjusted)
            },
          }}
          sliderParams={{
            sliderPercentage: leveragePercentage,
            setSliderPercentage: (e) => {
              handleLeverageSliderChange(e)
            },
            sliderLegendValues: leverageRange.sliderLegendValues,
            startEndRange: leverageRange.startEndRange,
            unit: "x",
          }}
        />
      </div>

      <GenericInputAssetAmount
        inputWeiValue={leveragedCollateralQuote}
        isLoading={isDumpUSGLoading || isZapLoading}
        label="You buy and deposit"
        depositSelect={<StaticCardAssetInput assetName={collateralInfo!.name} logoKey={collateralInfo!.logoKey} />}
        disabled={true}
        asset={collateralInfo}
        onValueChange={() => {}}
        bottomPart={<div className="flex select-none gap-2 text-xs text-subtitle">Minimum received {usgDumpValuesFormatted.minOutFormatted}</div>}
      />

      <RecapAccordion
        isLoading={isDumpUSGLoading || isZapLoading || isDepositLoading}
        isDisplayed={true}
        zappingParams={{
          label: "collateral",
          expected: swapValuesFormatted.expectedFormatted,
          minOut: swapValuesFormatted.minOutFormatted,
          slippage: slippage,
          leverage: leveragePercentage,
          priceImpact: Math.max(priceImpact, USGDumpPriceImpact),
        }}
        // aprVariationParams={aprVariation}
      />

      <MaxBorrowCapReached display={(!!zapValue || !!depositWeiValue) && maxBorrowCapReached} />

      {formState.errors
        .filter((e) => e.type === "form-alert")
        .map((error) => (
          <FormAlert key={error.key} error={error} className="my-1" isLoading={isTxLoading} />
        ))}

      {!!depositWeiValue && !isZapLoading && slippage >= 1 && (
        <SlippageAlert
          symbol={collateralInfo?.symbol as string}
          tokenLoss={slippageLoss?.tokenLoss}
          dollarLoss={slippageLoss?.dollarLoss}
          slippage={slippage}
          isLoading={isZapLoading}
          displayConfirmationButton={isTransactionBlockedBySlippage}
          onClickContinue={() => setIsTransactionBlockedBySlippage(false)}
        />
      )}

      {!isDumpUSGLoading && (priceImpact >= 0.25 || USGDumpPriceImpact >= 0.25) && (
        <PriceImpactAlert
          dollarLoss={priceImpactLoss}
          priceImpact={priceImpact}
          isLoading={isZapLoading}
          displayConfirmationButton={isTransactionBlockedByPriceImpact}
          mintDumpPriceImpact={USGDumpPriceImpact}
          mintDumpDollarLoss={formatDollar(USGDumpDollarLoss)}
          onClickContinue={() => setIsTransactionBlockedByPriceImpact(false)}
        />
      )}

      <FormButtons
        actions={{
          handleApprove: actionApprove,
          handleProcess: depositAsset && isZapping ? actionZapLeverage : actionLeverage,
        }}
        connect={connect}
        formState={formState}
        labelProcess={depositAsset && isZapping ? "Zap & leverage" : "Leverage"}
        isLoading={isDepositLoading || isZapLoading || isTxLoading || isDumpUSGLoading}
      />
    </div>
  )
}
