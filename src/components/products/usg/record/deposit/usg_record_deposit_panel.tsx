"use client"

import { cn } from "@/lib/utils"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGDepositContext } from "./usg_record_deposit_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import FormButtons from "@/components/design_system/form/form_actions"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { BorrowInput } from "@/components/design_system/inputs/borrow_input"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { AssetSelector } from "@/components/design_system/inputs/asset_selector"
import { IconThunder, IconCircleHelp, IconSingleArrow } from "@/components/icons"
import { USGStaticAssetSelector } from "@/components/design_system/structure/usg_static_selector"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MarketTransactionError } from "@/components/design_system/notifications/market_transaction_error"
import { CustomCollatAssetDisplay } from "@/components/design_system/structure/custom_collat_asset_display"

export default function USGDepositContent() {
  const {
    setDepositAsset,
    setDepositWeiValue,
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
    estimatedZapDollarValue,
    borrowWeiValue,
    isZapLoading,
    isDepositLoading,
    zapValue,
    depositAssetInfo,
    slippage,
    zapInnerValue,
    depositSliderPercent,
    borrowSliderPercent,
    maxBorrowableValue,
    maxDepositString,
    aprVariation,
    expectedCollateral,
    isZapping,
  } = useUSGDepositContext()

  const { connect } = useWalletConnexionContext()

  const { collateralInfo, isDepositAndBorrow, marketData, USGInfo, balanceAllowanceData, maxBorrowCapReached, displayAPRVariation } = useUSGRecordContext()

  const CustomAssetSelect = () => {
    return <AssetSelector collateralInfo={collateralInfo} depositAsset={depositAsset || collateralInfo.name} setDepositAsset={setDepositAsset} />
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-end justify-between gap-2">
        <span className="text-sm font-semibold md:text-xl">Deposit {collateralInfo?.symbol}</span>
        <span className="text-xs text-subtitle">{maxDepositString}</span>
      </div>

      <DepositInput
        displaySliderInput={true}
        depositAmount={depositWeiValue}
        depositSelect={<CustomAssetSelect />}
        isLoading={isDepositLoading}
        depositAsset={depositAssetInfo}
        balance={balanceAllowanceData?.balance || marketData?.collateralBalance}
        isZapping={isZapping}
        onValueChange={handleDepositChange}
        percentage={depositSliderPercent}
        setPercentage={setDepositSliderPercent}
        setMaxBalance={() => {
          setDepositWeiValue(balanceAllowanceData?.balance || marketData?.collateralBalance)
        }}
      />

      {depositAsset && isZapping && (
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
                  className="flex w-fit max-w-[120px] justify-start bg-transparent text-xl font-semibold focus:outline-none"
                  value={zapInnerValue ?? ""}
                  onChange={handleZapInputChange}
                />
              </div>
              <div className="flex items-center justify-start gap-2 text-xs text-subtitle">
                <div className="hidden md:flex">Minimum received </div>
                <div> {zapValue && !!marketData?.collateralInfos ? estimatedZapDollarValue : ""}</div>
              </div>
            </div>

            <CustomCollatAssetDisplay collateralInfo={collateralInfo} />
          </div>
        </PanelRaw>
      )}

      {isDepositAndBorrow && (
        <div className="flex flex-col gap-1">
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold md:text-xl">Borrow USG</span>
            <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 3)} USG</span>
          </div>
          <BorrowInput
            displaySliderInput={true}
            borrowAmount={borrowWeiValue}
            disabled={maxBorrowCapReached}
            labelDeposit="You borrow"
            depositSelect={<USGStaticAssetSelector />}
            borrowAsset={USGInfo}
            setMaxBalance={maxBorrowCapReached ? () => {} : () => setBorrowWeiValue(maxBorrowableValue)}
            balance={maxBorrowableValue}
            percentage={borrowSliderPercent}
            setPercentage={maxBorrowCapReached ? () => {} : setBorrowSliderPercent}
            onValueChange={(value: bigint | undefined) => {
              setBorrowWeiValue(value)
            }}
          />
        </div>
      )}

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
