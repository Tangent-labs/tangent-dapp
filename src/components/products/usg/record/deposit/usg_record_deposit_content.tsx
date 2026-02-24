"use client"

import { cn, PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGDepositContext } from "./usg_record_deposit_context"
import { FormButtons } from "@/components/design_system/form/form_actions"
import { BorderPanel } from "@/components/design_system/structure/border_panel"
import { SlippageInput } from "@/components/design_system/inputs/Slippage"
import { AssetSelector } from "@/components/design_system/inputs/asset_selector"
import { IconSingleArrow } from "@/components/icons"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MarketTransactionError } from "@/components/design_system/notifications/market_transaction_error"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { ExistingAsset } from "@/types"

export default function USGDepositContent() {
  const {
    setDepositAsset,
    actionApprove,
    actionDeposit,
    setBorrowWeiValue,
    handleDepositChange,
    getRouteAndDeposit,
    setSlippage,
    actionApproveZap,
    handleZapInputChange,
    setDepositSliderPercent,
    setBorrowSliderPercent,
    depositAsset,
    depositWeiValue,
    formState,
    minValueReceivedFromZap,
    borrowWeiValue,
    isZapLoading,
    isDepositLoading,
    zapValue,
    depositAssetInfo,
    slippage,
    depositSliderPercent,
    borrowSliderPercent,
    maxBorrowableValue,
    maxDepositString,
    aprVariation,
    expectedCollateral,
    isZapping,
  } = useUSGDepositContext()

  const { connect } = useWalletConnexionContext()

  const { collateralInfo, isDepositAndBorrow, marketData, balanceAllowanceData, maxBorrowCapReached, displayAPRVariation, USGInfo } = useUSGRecordContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-end justify-between gap-2">
        <span className="text-sm font-semibold md:text-xl">Deposit {collateralInfo?.symbol}</span>
        <span className="text-xs text-subtitle">{maxDepositString}</span>
      </div>

      {/* DEPOSIT INPUT */}
      <GenericInputAssetAmount
        inputWeiValue={depositWeiValue}
        onValueChange={(e) => {
          handleDepositChange(e)
        }}
        depositSelect={<AssetSelector collateralInfo={collateralInfo} depositAsset={depositAsset || collateralInfo.name} setDepositAsset={setDepositAsset} />}
        isLoading={isDepositLoading}
        asset={depositAssetInfo}
        label={isZapping ? "You sell" : "You deposit"}
        isZapping={isZapping}
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

      {/* ZAPPING RESULT INPUT */}

      {depositAsset && isZapping && (
        <GenericInputAssetAmount
          inputWeiValue={zapValue || 0n}
          onValueChange={(e) => {
            handleZapInputChange(e)
          }}
          asset={collateralInfo}
          isLoading={isZapLoading}
          label={"You buy and deposit"}
          depositSelect={<StaticCardAssetInput asset={collateralInfo.name as ExistingAsset} />}
          bottomPart={
            <div className="flex select-none gap-2 text-xs text-subtitle">
              Minimum received {zapValue && !!marketData?.collateralInfos ? minValueReceivedFromZap : ""}
            </div>
          }
        />
      )}

      {/* BORROW INPUT */}

      {isDepositAndBorrow && (
        <div className="flex flex-col gap-1">
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold md:text-xl">Borrow USG</span>
            <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 3)} USG</span>
          </div>
          <GenericInputAssetAmount
            inputWeiValue={borrowWeiValue}
            onValueChange={(value: bigint | undefined) => {
              setBorrowWeiValue(value)
            }}
            asset={USGInfo}
            disabled={maxBorrowCapReached}
            label="You borrow"
            depositSelect={<StaticCardAssetInput asset="USG" />}
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

      <div className="flex items-start justify-between gap-2">
        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem value="item-1">
            <BorderPanel className="flex cursor-pointer flex-col bg-white bg-opacity-[3%] px-2 text-xs text-primary">
              <AccordionTrigger>
                <span className="py-1.5">Recap</span>
              </AccordionTrigger>

              <AccordionContent className="w-full">
                <div className={cn("flex flex-col gap-1 rounded-[10px] text-xs", isDepositLoading ? "shimmer" : "")}>
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

                  <div className={cn(displayAPRVariation ? "mt-2 border-t border-white/30 pt-2" : "", "flex w-full items-center justify-between")}>
                    <span className="text-subtitle">Expected collateral: </span>

                    <span className="font-semibold text-white">{expectedCollateral}</span>
                  </div>
                </div>
              </AccordionContent>
            </BorderPanel>
          </AccordionItem>
        </Accordion>

        <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
      </div>

      <MarketTransactionError display={!!borrowWeiValue && formState?.cantProcessReasons.length > 0} error={formState?.cantProcessReasons[0]} />

      <MaxBorrowCapReached display={!borrowWeiValue && isDepositAndBorrow && maxBorrowCapReached} />

      <FormButtons
        actions={{
          handleApprove: depositAsset === "ETH" ? undefined : !!depositAsset && isZapping ? actionApproveZap : actionApprove,
          handleProcess: !!depositAsset && isZapping ? getRouteAndDeposit : actionDeposit,
        }}
        formState={formState}
        labelProcess={isDepositAndBorrow ? "Deposit & Borrow" : "Deposit"}
        connect={connect}
      />
    </div>
  )
}
