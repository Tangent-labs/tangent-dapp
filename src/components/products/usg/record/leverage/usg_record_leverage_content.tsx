"use client"

import { cn } from "@/lib/utils"
import { IconSingleArrow } from "@/components/icons"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGLeverageContext } from "./usg_record_leverage_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { SlippageAlert } from "@/components/design_system/inputs/slippage_alert"
import { ZapAssetSelector } from "@/components/design_system/inputs/asset_selector"
import { PriceImpactAlert } from "@/components/design_system/inputs/price_impact_alert"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
    minValueReceivedFromZap,
    minCollatReceivedFromUSGDump,
    expectedCollateral,
    depositSliderPercent,
    leveragePercentage,
    maxDepositString,
    computedMaxLeverage,
    aprVariation,
    isZapping,
    sliderLegendValues,
    startEndRange,
    slippageLoss,
    isTransactionBlockedBySlippage,
    setIsTransactionBlockedBySlippage,
    priceImpact,
    priceImpactLoss,
    isTransactionBlockedByPriceImpact,
    setIsTransactionBlockedByPriceImpact,
  } = useUSGLeverageContext()

  const { connect } = useWalletConnexionContext()

  const { collateralInfo, marketData, balanceAllowanceData, USGInfo, maxBorrowCapReached, displayAPRVariation } = useUSGRecordContext()

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
          label={"You deposit"}
          depositSelect={<StaticCardAssetInput assetName={collateralInfo!.name} logoKey={collateralInfo!.logoKey} />}
          bottomPart={
            <div className="flex select-none gap-2 text-xs text-subtitle">
              Minimum received {zapValue && !!marketData?.collateralInfos ? minValueReceivedFromZap : ""}
            </div>
          }
        />
      )}

      <>
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
          label="You buy and deposit"
          depositSelect={<StaticCardAssetInput assetName={collateralInfo!.name} logoKey={collateralInfo!.logoKey} />}
          disabled={true}
          asset={collateralInfo}
          onValueChange={() => {}}
          // isLoading={isQuoteLoading}
          bottomPart={
            <div className="flex select-none gap-2 text-xs text-subtitle">
              Minimum received {leveragedCollateralQuote && !!marketData?.collateralInfos ? minCollatReceivedFromUSGDump : ""}
            </div>
          }
        />

        <div className="flex items-start justify-start gap-2">
          <Accordion className={cn("w-full", isDepositLoading ? "shimmer rounded-[10px]" : "")} type="single" collapsible>
            <AccordionItem value="item-1">
              <ReliefCard className="flex cursor-pointer flex-col px-2 text-xs text-primary hover:bg-panel-hover">
                <AccordionTrigger>Recap</AccordionTrigger>

                <AccordionContent className="w-full">
                  <div className="flex flex-col gap-1 rounded-[10px] text-xs">
                    <div className="flex w-full items-center justify-between">
                      <span className="text-subtitle">Leverage : </span>
                      <span className="text-white">~{leveragePercentage.toFixed(2)}x</span>
                    </div>

                    {displayAPRVariation && (
                      <>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-subtitle">APR variation : </span>
                        </div>

                        <div className="flex w-full items-center justify-between">
                          <span className="ml-4 italic text-subtitle">Current </span>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-white">{aprVariation.current}</span>
                            <IconSingleArrow></IconSingleArrow>
                            <span className="text-tonic">{aprVariation.currentUpdated}</span>
                          </div>
                        </div>

                        <div className="flex w-full items-center justify-between">
                          <span className="ml-4 italic text-subtitle">Projected </span>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-white">{aprVariation.projected}</span>
                            <IconSingleArrow></IconSingleArrow>
                            <span className="text-tonic">{aprVariation.projectedUpdated}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <div
                      className={cn(
                        displayAPRVariation ? "mt-2 border-t border-white/10 pt-2" : "",
                        "flex w-full flex-col items-start justify-start md:flex-row md:items-center md:justify-between"
                      )}
                    >
                      <span className="text-subtitle">Expected collateral: </span>
                      <span className="text-white">
                        {expectedCollateral?.sum}
                        <span className="font-semibold text-white">{expectedCollateral?.result}</span>
                      </span>
                    </div>
                  </div>
                </AccordionContent>
              </ReliefCard>
            </AccordionItem>
          </Accordion>
          <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
        </div>
      </>

      <MaxBorrowCapReached display={(!!zapValue || !!depositWeiValue) && maxBorrowCapReached} />

      {!!depositWeiValue && isTransactionBlockedBySlippage && slippage >= 1 && (
        <SlippageAlert
          symbol={collateralInfo?.symbol as string}
          tokenLoss={slippageLoss?.tokenLoss}
          dollarLoss={slippageLoss?.dollarLoss}
          slippage={slippage}
          isLoading={isZapLoading}
          onClickContinue={() => setIsTransactionBlockedBySlippage(false)}
        />
      )}

      {!!depositWeiValue && isTransactionBlockedByPriceImpact && priceImpact >= 1 && (
        <PriceImpactAlert
          dollarLoss={priceImpactLoss}
          priceImpact={priceImpact}
          isLoading={isZapLoading}
          onClickContinue={() => setIsTransactionBlockedByPriceImpact(false)}
        />
      )}

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
