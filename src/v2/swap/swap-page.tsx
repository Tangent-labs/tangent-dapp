"use client"

import { ArrowDown } from "lucide-react"
import { useUSGSwapContext } from "@/components/products/usg/swap/usg_swap_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { RecapAccordion } from "@/components/design_system/structure/recap"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { SlippageAlert } from "@/components/design_system/inputs/slippage_alert"
import { PriceImpactAlert } from "@/components/design_system/inputs/price_impact_alert"
import { AssetSelectionDialog } from "@/components/design_system/inputs/asset-select-dialog"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { formatBigIntFloor } from "@/lib/number_formatter"

/**
 * V2 Swap page. Same context (USGSwapContext), same asset dialog options, same recap, same alerts and same FormButtons as USGSwapContent.
 * Only the arrangement changes: one focused card, balance above the first field, the flip button between the two fields.
 */
export function SwapPageV2() {
  const {
    handleSellChange,
    handleBuyChange,
    setSellAssetAddress,
    setBuyAssetAddress,
    setSlippage,
    setDepositSliderPercent,
    actionSwap,
    actionApprove,
    toggleTokensSwitch,
    formState,
    computedAssets,
    isSellValueLoading,
    isBuyValueLoading,
    buyAssetInfo,
    sellAssetInfo,
    sellAssetName,
    buyAssetName,
    sellWeiValue,
    buyWeiValue,
    isTxLoading,
    balanceAllowanceData,
    depositSliderPercent,
    slippage,
    zapValuesFormatted,
    isSwapBlockedByPriceImpact,
    setIsSwapBlockedByPriceImpact,
    isSwapBlockedBySlippage,
    setIsSwapBlockedBySlippage,
    slippageLoss,
    priceImpactLoss,
    priceImpact,
    isSwapReady,
  } = useUSGSwapContext()
  const { connect } = useWalletConnexionContext()
  const loading = isBuyValueLoading || isSellValueLoading

  const pick = (symbol: string, set: (a: `0x${string}`) => void) => set(computedAssets?.find((o) => o.symbol === symbol)?.address ?? "0x")

  return (
    <div className="w-full pb-20 pt-2 font-sans">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Swap</h1>
      <p className="mt-1 max-w-[640px] text-[14px] text-ink-2">
        Swap any asset for USG and the other Tangent assets, including Curve LPs and Wrapped Tangent Stablecoins.
      </p>

      <div className="mx-auto mt-8 w-full max-w-[480px] rounded-2xl border border-hairline bg-surface p-5">
        <div className="flex items-center justify-between text-xs text-ink-2">
          <span>Swap</span>
          <span className="text-ink-3">
            Balance {formatBigIntFloor(balanceAllowanceData?.balance ?? 0n, sellAssetInfo?.decimals || 18, 2)} {sellAssetInfo?.symbol}
          </span>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          <GenericInputAssetAmount
            isLoading={isSellValueLoading}
            inputWeiValue={sellWeiValue}
            onValueChange={handleSellChange}
            depositSelect={
              <AssetSelectionDialog
                template={() => null}
                value={sellAssetName || ""}
                options={computedAssets}
                onChange={(v: string) => pick(v, setSellAssetAddress)}
              />
            }
            slippageInput={<SlippageInput slippage={slippage} setSlippage={setSlippage} />}
            asset={sellAssetInfo!}
            label="You sell"
            maxAmountParams={{
              maxWeiValue: balanceAllowanceData?.balance ?? 0n,
              setMaxAmount: () => handleSellChange(balanceAllowanceData?.balance),
            }}
            sliderParams={{ sliderPercentage: depositSliderPercent, setSliderPercentage: setDepositSliderPercent }}
          />
          <button
            type="button"
            aria-label="Switch tokens"
            onClick={toggleTokensSwitch}
            className="z-10 -my-3 mx-auto grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-surface text-ink-2 transition-colors hover:text-white"
          >
            <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <GenericInputAssetAmount
            inputWeiValue={buyWeiValue}
            onValueChange={handleBuyChange}
            depositSelect={
              <AssetSelectionDialog
                template={() => null}
                value={buyAssetName!}
                options={computedAssets}
                onChange={(v: string) => pick(v, setBuyAssetAddress)}
              />
            }
            asset={buyAssetInfo!}
            label="You buy"
            isLoading={isBuyValueLoading}
            bottomPart={<div className="mt-1 select-none text-xs text-ink-3">Minimum received {zapValuesFormatted.minOutFormatted}</div>}
          />
        </div>

        <div className="mt-3 flex flex-col gap-3">
          <RecapAccordion
            isDisplayed={true}
            zappingParams={{
              label: buyAssetInfo?.symbol,
              expected: zapValuesFormatted.buyFormatted,
              minOut: zapValuesFormatted.minOutFormatted,
              slippage,
              priceImpact,
            }}
            isLoading={loading}
          />

          {formState.errors
            .filter((e) => e.type === "form-alert")
            .map((error) => (
              <FormAlert key={error.key} error={error} className="my-1" isLoading={loading} />
            ))}

          {isSwapReady && !loading && slippage >= 1 && (
            <SlippageAlert
              symbol={buyAssetInfo?.symbol as string}
              tokenLoss={slippageLoss?.tokenLoss}
              dollarLoss={slippageLoss?.dollarLoss}
              slippage={slippage}
              isLoading={loading}
              displayConfirmationButton={isSwapBlockedBySlippage}
              onClickContinue={() => setIsSwapBlockedBySlippage(false)}
            />
          )}

          {isSwapReady && priceImpact >= 0.25 && (
            <PriceImpactAlert
              dollarLoss={priceImpactLoss}
              priceImpact={priceImpact}
              isLoading={loading}
              displayConfirmationButton={isSwapBlockedByPriceImpact}
              onClickContinue={() => setIsSwapBlockedByPriceImpact(false)}
            />
          )}

          <FormButtons
            actions={{ handleApprove: actionApprove, handleProcess: actionSwap }}
            connect={connect}
            formState={formState}
            labelProcess="Swap"
            isLoading={isTxLoading || loading}
          />
        </div>
      </div>
    </div>
  )
}
