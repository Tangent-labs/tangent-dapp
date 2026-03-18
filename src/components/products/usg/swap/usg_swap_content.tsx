"use client"

import Image from "next/image"
import { Address } from "viem"
import { useUSGContext } from "../usg_context"
import { IconChevron } from "@/components/icons"
import { formatAddress } from "@/lib/other_formatter"
import { useUSGSwapContext } from "./usg_swap_context"
import { formatBigInt } from "@/lib/number_formatter"
import FormButtons from "@/components/design_system/form/form_actions"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { SlippageAlert } from "@/components/design_system/inputs/slippage_alert"
import { AssetSelectionDialog } from "@/components/design_system/inputs/asset-select-dialog"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"
import { UsgBalanceAndTotalPoints } from "@/components/design_system/structure/balance_and_total_points"

export default function USGSwapContent() {
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
    isSwapLoading,

    buyAssetInfo,
    sellAssetInfo,

    sellAssetName,
    buyAssetName,

    sellWeiValue,
    buyWeiValue,

    isLoading,
    balanceAllowanceData,
    depositSliderPercent,
    slippage,
    USGsUSGMetrics,
    minValueReceivedFromZap,

    isSwapBlocked,
    setIsSwapBlocked,

    slippageLoss,
  } = useUSGSwapContext()

  const { lpUserPoints, voteUserPoints } = useUSGContext()

  const { connect } = useWalletConnexionContext()

  const SellAssetSelect = () => {
    return (
      <AssetSelectionDialog
        template={AssetSelectTemplate}
        value={sellAssetName || ""}
        options={computedAssets}
        onChange={(v: string) => {
          const findMatching = computedAssets?.find((o) => o.symbol === v)
          setSellAssetAddress(findMatching?.address ?? "0x")
        }}
      />
    )
  }

  const BuyAssetSelect = () => {
    return (
      <AssetSelectionDialog
        template={AssetSelectTemplate}
        value={buyAssetName!}
        options={computedAssets}
        onChange={(v: string) => {
          const findMatching = computedAssets?.find((o) => o.symbol === v)
          setBuyAssetAddress(findMatching?.address ?? "0x")
        }}
      />
    )
  }

  const AssetSelectTemplate = (option: {
    logoURI?: string
    logoKey?: string
    value: string
    name?: string
    symbol: string
    balanceFormatted?: bigint
    decimals?: number
    address?: Address
  }) => {
    return (
      <div className="flex w-full min-w-48 cursor-pointer items-center justify-between px-2 py-1 hover:rounded-full hover:bg-white/30">
        <div className="flex w-full items-center gap-2">
          <>{option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={32} width={32} /> : <TokenImage token={option.logoKey} size={32} />}</>

          <div className="flex flex-col items-start justify-start">
            <span className="text-sm font-semibold">{option.symbol}</span>
            <span className="text-xs text-subtitle">{formatAddress(option?.address, 4)}</span>
          </div>
        </div>
        <span className="ml-auto text-xs text-subtitle">{option.balanceFormatted}</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-stretch justify-between gap-6">
        <ReliefCard className="relative hidden w-1/2 bg-panel-title-gradient xl:flex">
          <Image height={140} width={140} src="/medias/logos/swap.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

          <div className="flex flex-col items-start justify-center gap-3 pr-6">
            <span className="text-5xl font-semibold">Swap</span>
            <p className="text-[15px]">Swap any asset for USG and other Tangent&apos;s assets, including Curve LPs and Wrapped Tangent Stablecoins.</p>
          </div>
        </ReliefCard>

        <div className="flex h-auto w-full flex-col justify-between gap-[10px] xl:w-1/2">
          <PointsCampaignLiveCard />

          <UsgBalanceAndTotalPoints USGsUSGMetrics={USGsUSGMetrics} lpUserPoints={lpUserPoints} voteUserPoints={voteUserPoints} />
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-center">
        <ReliefCard className="flex w-full max-w-[450px] flex-col items-center justify-center p-4">
          <div className="mb-3 flex w-full items-end justify-end">
            <span className="text-xs text-subtitle">
              Max: {formatBigInt(balanceAllowanceData?.balance ?? 0n, sellAssetInfo?.decimals || 18, 2)} {sellAssetInfo?.symbol}
            </span>
          </div>
          <div className="w-full">
            <GenericInputAssetAmount
              inputWeiValue={sellWeiValue}
              onValueChange={handleSellChange}
              depositSelect={<SellAssetSelect />}
              asset={sellAssetInfo!}
              label={"You sell"}
              maxAmountParams={{
                maxWeiValue: balanceAllowanceData?.balance ?? 0n,
                setMaxAmount: () => () => handleSellChange(balanceAllowanceData?.balance),
              }}
              sliderParams={{
                sliderPercentage: depositSliderPercent,
                setSliderPercentage: setDepositSliderPercent,
              }}
            />

            <div
              onClick={() => {
                toggleTokensSwitch()
              }}
              className="my-2 flex w-full cursor-pointer items-center justify-center border-none"
            >
              <IconChevron className="h-auto w-8 rounded-[10px] border border-white border-white/10 border-opacity-10 bg-select-input stroke-white p-2 text-white backdrop-blur-[60px] hover:bg-white/10" />
            </div>

            <GenericInputAssetAmount
              inputWeiValue={buyWeiValue}
              onValueChange={handleBuyChange}
              depositSelect={<BuyAssetSelect />}
              asset={buyAssetInfo!}
              label={"You buy"}
              isLoading={isLoading || isSwapLoading}
              bottomPart={<div className="flex select-none gap-2 text-xs text-subtitle">Minimum received {buyWeiValue ? minValueReceivedFromZap : ""}</div>}
            />
          </div>

          <div className="mt-2 flex w-full items-end justify-end gap-2">
            <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
          </div>

          {!!buyWeiValue && !!sellWeiValue && isSwapBlocked && slippage >= 1 && (
            <SlippageAlert
              symbol={buyAssetInfo?.symbol as string}
              tokenLoss={slippageLoss?.tokenLoss}
              dollarLoss={slippageLoss?.dollarLoss}
              slippage={slippage}
              isLoading={isLoading || isSwapLoading}
              onClickContinue={() => setIsSwapBlocked(false)}
            />
          )}

          <div className="mt-2 flex w-full">
            <FormButtons
              actions={{
                handleApprove: actionApprove,
                handleProcess: actionSwap,
              }}
              connect={connect}
              formState={formState}
              labelProcess="Swap"
              isLoading={isLoading}
            />
          </div>
        </ReliefCard>
      </div>
    </>
  )
}
