"use client"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { useUSGRecordContext } from "../usg_record_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import { useUSGLeverageContext } from "./usg_record_leverage_context"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { LeverageInput } from "@/components/design_system/inputs/leverage_input"
import { IconThunder, IconCircleHelp, IconSingleArrow } from "@/components/icons"
import { AssetSelector } from "@/components/design_system/inputs/asset_selector"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { MarketTransactionError } from "@/components/design_system/notifications/market_transaction_error"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function USGLeverageContent() {
  const {
    setDepositAsset,
    setIsDepositDisabled,
    setIsLeverageAllPosition,
    setDepositWeiValue,
    actionApprove,
    handleDepositChange,
    setSlippage,
    handleZapInputChange,
    setDepositSliderPercent,
    setLeveragePercentage,
    actionLeverage,
    updateBorrowWeiValue,
    actionZapLeverage,
    actionApproveZap,
    isLeverageAllPosition,
    depositAsset,
    depositWeiValue,
    formState,
    isZapLoading,
    leverageExceedsMaxLtv,
    isDepositLoading,
    isDepositDisabled,
    zapValue,
    depositAssetInfo,
    slippage,
    estimatedZapDollarValue,
    expectedCollateral,
    zapInnerValue,
    depositSliderPercent,
    leveragePercentage,
    maxDepositString,
    computedMaxLeverage,
    aprVariation,
    computedDepositAmount,
    isZapping,
  } = useUSGLeverageContext()

  const { connect } = useWalletConnexionContext()

  const { collateralInfo, marketData, balanceAllowanceData, pricedCollateralInfo, USGInfo, maxBorrowCapReached, displayAPRVariation } = useUSGRecordContext()

  const CustomAssetSelect = () => {
    return <AssetSelector collateralInfo={collateralInfo} depositAsset={depositAsset || collateralInfo.name} setDepositAsset={setDepositAsset} />
  }

  return (
    <div className="flex flex-col gap-2">
      {!!marketData?.collateralInfos?.positionCollateralAmount && marketData?.collateralInfos?.positionCollateralAmount > 0n && (
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center justify-between gap-2">
            {!!marketData?.collateralInfos?.positionCollateralAmount &&
              marketData?.collateralInfos?.positionCollateralAmount > 0n &&
              !isLeverageAllPosition && (
                <>
                  <span className="text-sm text-subtitle">Leverage only</span>
                  <Switch checked={isDepositDisabled} onCheckedChange={(v) => setIsDepositDisabled(v)} />
                </>
              )}

            {!!marketData?.collateralInfos?.positionCollateralAmount && marketData?.collateralInfos?.positionCollateralAmount > 0n && !isDepositDisabled && (
              <>
                <span className="text-sm text-subtitle">Leverage all</span>
                <Switch checked={isLeverageAllPosition} onCheckedChange={(v) => setIsLeverageAllPosition(v)} />
              </>
            )}
          </div>
        </div>
      )}

      {!isDepositDisabled && (
        <>
          <div className="flex w-full items-end justify-between gap-2">
            <span className="text-sm font-semibold md:text-xl">Deposit {collateralInfo?.symbol}</span>
            <span className="text-xs text-subtitle">{maxDepositString}</span>
          </div>

          <DepositInput
            displaySliderInput={true}
            depositAmount={depositWeiValue}
            depositSelect={<CustomAssetSelect />}
            isLoading={isZapLoading}
            depositAsset={depositAssetInfo}
            balance={!!depositAssetInfo ? balanceAllowanceData?.balance : marketData?.collateralBalance}
            isZapping={isZapping}
            onValueChange={handleDepositChange}
            percentage={depositSliderPercent}
            setPercentage={setDepositSliderPercent}
            setMaxBalance={() => {
              setDepositWeiValue(marketData?.collateralBalance || 0n)
            }}
          />
        </>
      )}

      {!isDepositDisabled && depositAsset && isZapping && (
        <PanelRaw className={`${isZapLoading ? "shimmer" : ""} flex flex-col gap-1 p-2`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start justify-start">
              <div className="flex items-center justify-center gap-1">
                <div className="text-sm text-subtitle">Zap</div>
                <IconThunder className="h-auto w-[8px] text-row-tonic" />
                <IconCircleHelp className="h-auto w-[12px] text-row-tonic" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  disabled={isZapLoading}
                  className="flex w-fit max-w-28 justify-start bg-transparent text-xl font-semibold focus:outline-none"
                  value={zapInnerValue ?? ""}
                  onChange={handleZapInputChange}
                />
              </div>

              <div className="flex justify-between gap-2 text-xs text-subtitle">
                <div>Minimum received</div>
                <div>{zapValue && !!marketData?.collateralInfos ? estimatedZapDollarValue : ""}</div>
              </div>
            </div>
            <BorderPanel className="flex items-center justify-center gap-2 bg-select-input px-2.5 py-2">
              <TokenImage token={collateralInfo?.logo} size={32} />
              <div className="font-semibold">{collateralInfo?.symbol}</div>
            </BorderPanel>
          </div>
        </PanelRaw>
      )}

      <>
        <div className="flex flex-col gap-1">
          <div className="flex w-full items-end justify-between gap-1">
            <span className="flex items-start justify-start text-sm font-semibold md:text-xl">Borrow USG</span>

            <div className="flex items-end justify-end text-xs text-subtitle">{computedMaxLeverage}</div>
          </div>

          <LeverageInput
            label="You borrow"
            depositAmount={computedDepositAmount}
            borrowAsset={USGInfo}
            depositAsset={pricedCollateralInfo}
            percentage={leveragePercentage}
            setPercentage={setLeveragePercentage}
            onValueChange={(e) => updateBorrowWeiValue(e)}
          />
        </div>

        <div className="flex items-start justify-start gap-2">
          <Accordion className={cn("w-full", isDepositLoading ? "shimmer rounded-[10px]" : "")} type="single" collapsible>
            <AccordionItem value="item-1">
              <BorderPanel className="flex w-full cursor-pointer flex-col bg-white bg-opacity-[3%] px-2 text-xs text-primary backdrop-blur-[60px]">
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
              </BorderPanel>
            </AccordionItem>
          </Accordion>
          <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
        </div>
      </>

      <MarketTransactionError display={!!depositWeiValue && formState?.cantProcessReasons.length > 0} error={formState?.cantProcessReasons[0]} />

      {leverageExceedsMaxLtv && (
        <div className="flex w-full items-center justify-center text-xs text-red-500">Reduce your leverage or add more collateral.</div>
      )}

      <MaxBorrowCapReached display={(!!zapValue || !!depositWeiValue) && maxBorrowCapReached} />

      <FormButtons
        actions={{
          handleApprove: depositAsset && isZapping ? actionApproveZap : actionApprove,
          handleProcess: depositAsset && isZapping ? actionZapLeverage : actionLeverage,
        }}
        connect={connect}
        formState={formState}
        labelProcess={depositAsset && isZapping ? "Zap & leverage" : "Leverage"}
      />
    </div>
  )
}
