"use client"

import { PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGDepositContext } from "./usg_record_deposit_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import FormButtons from "@/components/design_system/form/form_actions"
import { ZapAssetSelector } from "@/components/design_system/inputs/asset_selector"
import { RecapAccordion } from "@/components/design_system/structure/recap"
import { SlippageAlert } from "@/components/design_system/inputs/slippage_alert"
import { PriceImpactAlert } from "@/components/design_system/inputs/price_impact_alert"
import { FormAlert } from "@/components/design_system/inputs/form_alert"

export default function USGDepositContent() {
  const {
    setDepositAsset,
    actionApprove,
    actionDeposit,
    setBorrowWeiValue,
    handleDepositChange,
    getRouteAndDeposit,
    setSlippage,
    handleZapInputChange,
    setDepositSliderPercent,
    setBorrowSliderPercent,
    depositAsset,
    depositWeiValue,
    formState,
    zapValuesFormatted,
    borrowWeiValue,

    isDepositLoading,
    isZapLoading,
    isTxLoading,

    zapValue,
    depositAssetInfo,
    slippage,
    depositSliderPercent,
    borrowSliderPercent,
    maxBorrowableValue,
    maxDepositString,
    // aprVariation,
    isZapping,
    slippageLoss,
    isTransactionBlockedBySlippage,
    setIsTransactionBlockedBySlippage,
    priceImpact,
    priceImpactLoss,
    isTransactionBlockedByPriceImpact,
    setIsTransactionBlockedByPriceImpact,
  } = useUSGDepositContext()

  const { collateralInfo, isDepositAndBorrow, marketData, balanceAllowanceData, maxBorrowCapReached, USGInfo } = useUSGRecordContext()

  const { connect } = useWalletConnexionContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-end justify-between gap-2">
        <span className="text-sm font-semibold md:text-xl">Deposit {collateralInfo.symbol?.replaceAll("-", "/")}</span>
        <span className="text-xs text-subtitle">{maxDepositString}</span>
      </div>

      {/* DEPOSIT INPUT */}
      <GenericInputAssetAmount
        inputWeiValue={depositWeiValue}
        onValueChange={(e) => {
          handleDepositChange(e)
        }}
        slippageInput={isZapping ? <SlippageInput slippage={slippage} setSlippage={setSlippage} /> : <></>}
        depositSelect={<ZapAssetSelector collateralInfo={collateralInfo} depositAsset={depositAsset} setDepositAsset={setDepositAsset} caseType="deposit" />}
        asset={depositAssetInfo}
        label={isZapping ? "You sell" : "You deposit"}
        isZapping={isZapping}
        isLoading={isDepositLoading}
        maxAmountParams={{
          maxWeiValue: balanceAllowanceData?.balance || 0n,
          setMaxAmount: () => {
            handleDepositChange(balanceAllowanceData?.balance || 0n)
          },
        }}
        sliderParams={{
          sliderPercentage: depositSliderPercent,
          setSliderPercentage: setDepositSliderPercent,
        }}
      />

      {/* 
        ZAPPING RESULT INPUT 
        SHOWN ONLY WHEN ZAPPING 
      */}

      {depositAsset && isZapping && (
        <GenericInputAssetAmount
          inputWeiValue={zapValue || 0n}
          onValueChange={(e) => {
            handleZapInputChange(e)
          }}
          asset={collateralInfo}
          isLoading={isZapLoading}
          label={"You buy and deposit"}
          depositSelect={<StaticCardAssetInput assetName={collateralInfo.name} logoKey={collateralInfo.logoKey} />}
          bottomPart={
            <div className="flex select-none gap-2 text-xs text-subtitle">
              Minimum received {zapValue && !!marketData?.collateralInfos && zapValuesFormatted.minOutFormatted}
            </div>
          }
        />
      )}

      {/* 
        BORROW INPUT 
        SHOW ONLY ON DEPOSIT & BORROW
      */}

      {isDepositAndBorrow && (
        <div className="flex flex-col gap-1">
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold md:text-xl">Borrow USG</span>
            <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 2)} USG</span>
          </div>
          <GenericInputAssetAmount
            inputWeiValue={borrowWeiValue}
            onValueChange={(value: bigint | undefined) => {
              setBorrowWeiValue(value)
            }}
            asset={USGInfo}
            disabled={maxBorrowCapReached}
            label="You borrow"
            depositSelect={<StaticCardAssetInput assetName="USG" logoKey="USG" />}
            maxAmountParams={{ maxWeiValue: maxBorrowableValue, setMaxAmount: maxBorrowCapReached ? () => {} : () => setBorrowWeiValue(maxBorrowableValue) }}
            sliderParams={{
              sliderPercentage: borrowSliderPercent,
              setSliderPercentage: maxBorrowCapReached ? () => {} : setBorrowSliderPercent,
              sliderLegendValues: PERCENTAGE_INPUT_AMOUNT,
            }}
          />
        </div>
      )}

      {/* RECAP */}
      <RecapAccordion
        className=""
        isDisplayed={isZapping}
        isLoading={isZapLoading}
        zappingParams={{
          label: "collateral",
          expected: `${zapValuesFormatted.expectedFormatted} ${collateralInfo.symbol}`,
          minOut: `${zapValuesFormatted.minOutFormatted} ${collateralInfo.symbol}`,
          slippage: slippage,
          priceImpact: priceImpact,
        }}
        // aprVariationParams={aprVariation}
      ></RecapAccordion>

      <MaxBorrowCapReached display={!borrowWeiValue && isDepositAndBorrow && maxBorrowCapReached} />

      {formState.errors
        .filter((e) => e.type === "form-alert")
        .map((error) => (
          <FormAlert key={error.key} error={error} className="my-1" isLoading={isTxLoading} />
        ))}

      {!!depositWeiValue && slippage >= 1 && (
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

      {!!depositWeiValue && priceImpact >= 0.25 && (
        <PriceImpactAlert
          dollarLoss={priceImpactLoss}
          priceImpact={priceImpact}
          isLoading={isZapLoading}
          displayConfirmationButton={isTransactionBlockedByPriceImpact}
          onClickContinue={() => setIsTransactionBlockedByPriceImpact(false)}
        />
      )}

      <FormButtons
        actions={{
          handleApprove: depositAsset === "ETH" ? undefined : actionApprove,
          handleProcess: !!depositAsset && isZapping ? getRouteAndDeposit : actionDeposit,
        }}
        formState={formState}
        labelProcess={isDepositAndBorrow ? "Deposit & Borrow" : "Deposit"}
        connect={connect}
        isLoading={isDepositLoading || isZapLoading || isTxLoading}
      />
    </div>
  )
}
