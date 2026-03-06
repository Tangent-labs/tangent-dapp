"use client"

import { cn } from "@/lib/utils"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGLeverageContext } from "./usg_record_leverage_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { AssetSelector } from "@/components/design_system/inputs/asset_selector"
import { IconSingleArrow } from "@/components/icons"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MarketTransactionError } from "@/components/design_system/notifications/market_transaction_error"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { ExistingAsset } from "@/types"

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
              <AssetSelector collateralInfo={collateralInfo} depositAsset={depositAsset || collateralInfo.name} setDepositAsset={setDepositAsset} />
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
          depositSelect={<StaticCardAssetInput asset={collateralInfo.name as ExistingAsset} />}
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
            depositSelect={<StaticCardAssetInput asset="USG" />}
            label="You borrow and sell"
            asset={USGInfo}
            maxAmountParams={{ maxWeiValue: 0n, setMaxAmount: () => handleLeverageSliderChange(10) }}
            sliderParams={{
              sliderPercentage: leveragePercentage,
              setSliderPercentage: (e) => handleLeverageSliderChange(e),
              sliderLegendValues: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], // TODO Need to be dynamic
              startEndRange: ["1", "10", "0.1"], // NeedTODO  to be dynamic
              unit: "x",
            }}
          />
        </div>

        <GenericInputAssetAmount
          inputWeiValue={leveragedCollateralQuote}
          label="You buy and deposit"
          depositSelect={<StaticCardAssetInput asset={collateralInfo.name as ExistingAsset} />}
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
              <ReliefCard className="flex cursor-pointer flex-col px-2 text-xs text-primary">
                <AccordionTrigger>
                  <span className="py-1.5">Recap</span>
                </AccordionTrigger>
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
                        displayAPRVariation ? "mt-2 border-t border-white/30 pt-2" : "",
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
