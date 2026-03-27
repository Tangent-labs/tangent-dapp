"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { zeroAddress } from "viem"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGRepayContext } from "./usg_record_repay_context"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import FormButtons from "@/components/design_system/form/form_actions"
import { AssetInfos, ZapAssetSelector } from "@/components/design_system/inputs/asset_selector"
import { RecapAccordion } from "@/components/design_system/structure/recap"
import { SlippageAlert } from "@/components/design_system/inputs/slippage_alert"
import { PriceImpactAlert } from "@/components/design_system/inputs/price_impact_alert"

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
    setIsTransactionBlockedBySlippage,
    setIsTransactionBlockedByPriceImpact,
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
    zapValuesFormatted,
    slippageLoss,
    isTransactionBlockedBySlippage,
    priceImpact,
    priceImpactLoss,
    isTransactionBlockedByPriceImpact,
  } = useUSGRepayContext()

  const { connect } = useWalletConnexionContext()

  const { USGInfo, collateralInfo, marketData, isRepayAndWithdraw, depositAssetOptions, isTxLoading } = useUSGRecordContext()

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
          slippageInput={isZapping && <SlippageInput slippage={slippage} setSlippage={setSlippage} />}
          disabled={isRepayMax}
          isZapping={isZapping}
          asset={repayAssetInfo || USGInfo}
          onValueChange={handleRepayValueChange}
          handleInputChangeDebounceTime={600}
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
                Minimum received {usgRepayedValue && USGInfo?.price !== 0 ? zapValuesFormatted.minOutFormatted : ""}
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

      {isZapping && (
        <RecapAccordion
          isLoading={isZapLoading}
          isDisplayed={isZapping}
          zappingParams={{
            label: "debt repaid",
            expected: `${zapValuesFormatted.expectedFormatted} USG`,
            minOut: `${zapValuesFormatted.minOutFormatted} USG`,
            slippage: slippage,
            priceImpact: priceImpact,
          }}
        />
      )}

      <>
        {isDebtBelowThreshold && (
          <div className="flex w-full items-center justify-center text-xs text-red-500">Remaining debt can not be lower than $3,000</div>
        )}
      </>

      {!!repayWeiValue && slippage >= 1 && (
        <SlippageAlert
          symbol="USG"
          tokenLoss={slippageLoss?.tokenLoss}
          dollarLoss={slippageLoss?.dollarLoss}
          slippage={slippage}
          isLoading={isZapLoading}
          displayConfirmationButton={isTransactionBlockedBySlippage}
          onClickContinue={() => setIsTransactionBlockedBySlippage(false)}
        />
      )}

      {!!repayWeiValue && priceImpact >= 1 && (
        <PriceImpactAlert
          dollarLoss={priceImpactLoss}
          priceImpact={priceImpact}
          isLoading={isZapLoading}
          displayConfirmationButton={isTransactionBlockedByPriceImpact}
          onClickContinue={() => setIsTransactionBlockedByPriceImpact(false)}
        />
      )}

      <FormButtons
        connect={connect}
        actions={{
          handleApprove: repayAsset && repayAsset !== "USG" ? actionApprove : undefined,
          handleProcess: repayAsset && repayAsset !== "USG" ? actionZapRepay : actionRepay,
        }}
        formState={formState}
        labelProcess={isRepayAndWithdraw ? "Repay & withdraw" : "Repay"}
        isLoading={isZapLoading || isTxLoading}
      />
    </div>
  )
}
