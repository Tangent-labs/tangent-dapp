"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { zeroAddress } from "viem"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGRepayContext } from "./usg_record_repay_context"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import FormButtons from "@/components/design_system/form/form_actions"
import { AssetInfos, ZapAssetSelector } from "@/components/design_system/inputs/asset_selector"

export default function USGRepayContent() {
  const {
    actionRepay,
    setPercentage,
    setWithdrawWeiValue,
    setWithdrawPercentage,
    setRepayAsset,
    handleRepayValueChange,
    actionZapRepay,
    actionApprove,
    setSlippage,
    setWithdrawSelectedAsset,
    slippage,
    repayWeiValue,
    repayAsset,
    maxRepayableValue,
    formState,
    percentage,
    isRepayMax,
    withdrawWeiValue,
    maxWithdrawable,
    withdrawPercentage,
    isZapLoading,
    usgRepayedValue,
    isDebtBelowThreshold,
    repayAssetInfo,
    withdrawSelectedAsset,
    expectedUSG,
    repayLoading,
    minValueReceivedFromZap,
  } = useUSGRepayContext()

  const { connect } = useWalletConnexionContext()

  const { USGInfo, collateralInfo, marketData, isRepayAndWithdraw, depositAssetOptions } = useUSGRecordContext()

  const isZapping = !!repayAsset && repayAsset !== "USG"

  const WithdrawAssetSelectTemplate = (option: AssetInfos) => {
    return (
      <div className="flex w-full cursor-pointer items-center gap-2 rounded-[10px] py-1 hover:bg-white/10">
        <TokenImage token={option?.logoKey} size={32} />
        <span className="text-sm font-semibold">{option.symbol}</span>
      </div>
    )
  }
  let assetSelectElement = <></>
  if (collateralInfo) {
    assetSelectElement =
      marketData?.constants?.receipt !== zeroAddress ? (
        <InputSelect
          className="w-full"
          template={WithdrawAssetSelectTemplate}
          value={withdrawSelectedAsset || collateralInfo?.symbol}
          options={depositAssetOptions} // Cast to any to satisfy InputSelect generic
          onChange={(v) => setWithdrawSelectedAsset(v)}
        />
      ) : (
        <StaticCardAssetInput assetName={collateralInfo.name} logoKey={collateralInfo.logoKey} />
      )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold md:text-xl">Repay debt</span>

          <span className="text-xs text-subtitle">
            Max: {formatBigInt(maxRepayableValue, repayAssetInfo?.decimals || 18, 3)} {repayAssetInfo?.symbol || "USG"}
          </span>
        </div>

        <GenericInputAssetAmount
          inputWeiValue={repayWeiValue}
          label={isZapping ? "You sell" : "You repay"}
          depositSelect={
            <ZapAssetSelector collateralInfo={collateralInfo} depositAsset={repayAsset || "USG"} setDepositAsset={setRepayAsset} caseType="repay" />
          }
          disabled={isRepayMax}
          isZapping={isZapping}
          asset={repayAssetInfo || USGInfo}
          onValueChange={handleRepayValueChange}
          maxAmountParams={{ maxWeiValue: maxRepayableValue, setMaxAmount: () => handleRepayValueChange(maxRepayableValue) }}
          sliderParams={{
            sliderPercentage: percentage,
            setSliderPercentage: setPercentage,
          }}
        />

        {repayAsset && repayAsset !== "USG" && (
          <GenericInputAssetAmount
            inputWeiValue={usgRepayedValue}
            label={"You buy and repay"}
            isLoading={isZapLoading}
            depositSelect={<StaticCardAssetInput assetName="USG" logoKey="USG" />}
            disabled={isRepayMax}
            asset={USGInfo}
            bottomPart={
              <div className="flex select-none justify-between gap-2 text-xs text-subtitle">
                Minimum received {usgRepayedValue && USGInfo?.price !== 0 ? minValueReceivedFromZap : ""}
              </div>
            }
          />
        )}

        {isRepayAndWithdraw && (
          <div className="flex flex-col gap-1">
            <div className="flex items-end justify-between">
              <span className="text-sm font-semibold md:text-xl">Withdraw collateral</span>
              <span className="text-xs text-subtitle">
                Max: {formatBigInt(maxWithdrawable, 18, 2)} {withdrawSelectedAsset}
              </span>
            </div>

            <GenericInputAssetAmount
              inputWeiValue={withdrawWeiValue}
              label="You withdraw"
              depositSelect={assetSelectElement}
              asset={collateralInfo}
              onValueChange={(value: bigint | undefined) => {
                setWithdrawWeiValue(value)
              }}
              maxAmountParams={{ maxWeiValue: maxWithdrawable, setMaxAmount: () => setWithdrawWeiValue(maxWithdrawable) }}
              sliderParams={{
                sliderPercentage: withdrawPercentage,
                setSliderPercentage: setWithdrawPercentage,
                sliderLegendValues: PERCENTAGE_INPUT_AMOUNT,
              }}
            />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem value="item-1">
            <ReliefCard className="flex cursor-pointer flex-col px-2 text-xs text-primary hover:bg-panel-hover">
              <AccordionTrigger>Recap</AccordionTrigger>

              <AccordionContent className="w-full">
                <div className="flex w-full items-center justify-between">
                  <span className="text-subtitle">Expected collateral: </span>

                  <span className="font-semibold text-white">{expectedUSG}</span>
                </div>
              </AccordionContent>
            </ReliefCard>
          </AccordionItem>
        </Accordion>

        <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
      </div>

      <>
        {isDebtBelowThreshold && (
          <div className="flex w-full items-center justify-center text-xs text-red-500">Remaining debt can not be lower than $3,000</div>
        )}
      </>
      <>
        {!isDebtBelowThreshold && !!repayWeiValue && formState.cantProcessReasons.length > 0 && (
          <div className="flex w-full items-center justify-center text-xs text-red-500"> {formState.cantProcessReasons[0]}</div>
        )}
      </>

      <FormButtons
        connect={connect}
        actions={{
          handleApprove: repayAsset && repayAsset !== "USG" ? actionApprove : undefined,
          handleProcess: repayAsset && repayAsset !== "USG" ? actionZapRepay : actionRepay,
        }}
        formState={formState}
        labelProcess={isRepayAndWithdraw ? "Repay & withdraw" : "Repay"}
        isLoading={repayLoading || isZapLoading}
      />
    </div>
  )
}
