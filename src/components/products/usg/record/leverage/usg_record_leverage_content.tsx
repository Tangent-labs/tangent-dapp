"use client"

import { useUSGRecordContext } from "../usg_record_context"
import { useUSGLeverageContext } from "./usg_record_leverage_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { ZapAssetSelector } from "@/components/design_system/inputs/asset_selector"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { MarketTransactionError } from "@/components/design_system/notifications/market_transaction_error"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { RecapAccordion } from "@/components/design_system/structure/recap"

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
    actionApproveZap,
    handleLeverageSliderChange,
    depositAsset,
    depositWeiValue,
    formState,
    isZapLoading,
    isDepositLoading,
    isDepositDisabled,
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
    computedMaxLeverage,
    // aprVariation,
    isZapping,
    sliderLegendValues,
    startEndRange,
  } = useUSGLeverageContext()

  const { connect } = useWalletConnexionContext()

  const { collateralInfo, marketData, balanceAllowanceData, USGInfo, maxBorrowCapReached } = useUSGRecordContext()

  return (
    <div className="flex flex-col gap-2">
      {!isDepositDisabled && (
        <>
          <div className="flex w-full items-end justify-between gap-2">
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
            isLoading={false}
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
        </>
      )}

      {!isDepositDisabled && depositAsset && isZapping && (
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

          <div className="flex items-end justify-end text-xs text-subtitle">{computedMaxLeverage}</div>
        </div>

        <GenericInputAssetAmount
          inputWeiValue={borrowWeiValue}
          onValueChange={(e) => handleBorrowChange(e)}
          depositSelect={<StaticCardAssetInput assetName="USG" logoKey="USG" />}
          label="You borrow and sell"
          asset={USGInfo}
          maxAmountParams={{
            maxWeiValue: 0n,
            setMaxAmount: () => handleLeverageSliderChange(Math.floor((1 / (1 - Number(marketData?.constants?.maxLTV) / 100000)) * 100) / 100),
          }}
          sliderParams={{
            sliderPercentage: leveragePercentage,
            setSliderPercentage: (e) => handleLeverageSliderChange(e),
            sliderLegendValues,
            startEndRange,
            unit: "x",
          }}
        />
      </div>

      <GenericInputAssetAmount
        inputWeiValue={leveragedCollateralQuote}
        isLoading={isDepositLoading}
        label="You buy and deposit"
        depositSelect={<StaticCardAssetInput assetName={collateralInfo!.name} logoKey={collateralInfo!.logoKey} />}
        disabled={true}
        asset={collateralInfo}
        onValueChange={() => {}}
        bottomPart={<div className="flex select-none gap-2 text-xs text-subtitle">Minimum received {usgDumpValuesFormatted.minOutFormatted}</div>}
      />

      <RecapAccordion
        isLoading={isDepositLoading || isZapLoading}
        isDisplayed={true}
        zappingParams={{
          label: "collateral",
          expected: swapValuesFormatted.expectedFormatted,
          minOut: swapValuesFormatted.minOutFormatted,
          slippage: slippage,
          leverage: leveragePercentage,
        }}
        // aprVariationParams={aprVariation}
      />

      <MarketTransactionError display={!!depositWeiValue && formState?.cantProcessReasons.length > 0} error={formState?.cantProcessReasons[0]} />

      <MaxBorrowCapReached display={(!!zapValue || !!depositWeiValue) && maxBorrowCapReached} />

      <FormButtons
        actions={{
          handleApprove: depositAsset && isZapping ? actionApproveZap : actionApprove,
          handleProcess: depositAsset && isZapping ? actionZapLeverage : actionLeverage,
        }}
        connect={connect}
        formState={formState}
        labelProcess={depositAsset && isZapping ? "Zap & leverage" : "Leverage"}
        isLoading={isDepositLoading}
      />
    </div>
  )
}
