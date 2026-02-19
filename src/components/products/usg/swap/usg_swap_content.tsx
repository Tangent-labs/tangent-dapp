"use client"

import Image from "next/image"
import { Address } from "viem"
import { ExistingAsset } from "@/types"
import { DepositReceiveAsset } from "../usg_type"
import { formatBigInt, formatNumber } from "@/lib/number_formatter"
import { useUSGSwapContext } from "./usg_swap_context"
import { formatAddress } from "@/lib/other_formatter"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { BuySellInput } from "@/components/design_system/inputs/buy_sell_input"
import AssetSelectionDialog from "@/components/design_system/inputs/asset-select-dialog"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import PointsCampaignLiveCard from "@/components/design_system/structure/points_campaign_live_card"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { ThreeCardRowWithMask } from "@/components/design_system/structure/three_cards_with_background_and_neon"
import { useUSGContext } from "../usg_context"

type AssetSelectProps = {
  options: DepositReceiveAsset[]
}

export default function USGSwapContent() {
  const {
    setIsBuying,
    handleDepositChange,
    handleReceiveChange,
    setDepositAsset,
    setReceiveAsset,
    setSlippage,
    setDepositSliderPercent,
    actionSwap,
    actionApprove,
    toggleTokensSwitch,
    formState,
    computedAssets,
    isSwapLoading,
    depositAssetInfo,
    depositWeiValue,
    depositAsset,
    receiveAsset,
    isBuying,
    isLoading,
    balanceAllowanceData,
    receiveWeiValue,
    receiveAssetInfo,
    depositSliderPercent,
    slippage,
    USGsUSGMetrics,
  } = useUSGSwapContext()

  const { lpUserPoints, voteUserPoints } = useUSGContext()

  const { connect } = useWalletConnexionContext()

  const ReceiveAssetSelect = ({ options }: AssetSelectProps) => {
    if (!options) {
      return (
        <AssetSelectionDialog
          className="w-full"
          template={AssetSelectTemplate}
          value={receiveAsset}
          options={[]}
          onChange={(v: string) => setReceiveAsset(v)}
        />
      )
    }

    return (
      <AssetSelectionDialog
        className="w-full"
        template={AssetSelectTemplate}
        value={receiveAsset}
        options={options}
        onChange={(v: string) => setReceiveAsset(v)}
      />
    )
  }

  const DepositAssetSelect = ({ options }: AssetSelectProps) => {
    return <AssetSelectionDialog template={AssetSelectTemplate} value={depositAsset || ""} options={options} onChange={(v: string) => setDepositAsset(v)} />
  }

  const AssetSelectTemplate = (option: {
    logoURI?: string
    logo?: ExistingAsset
    value: string
    name?: string
    symbol: string
    balance?: bigint
    decimals?: number
    address?: Address
  }) => {
    return (
      <div className="flex w-full min-w-48 cursor-pointer items-center justify-between px-2 py-1 hover:rounded-full hover:bg-white/30">
        <div className="flex w-full items-center gap-2">
          <>
            {option.symbol === "ETH" ? (
              <TokenImage token={option.logo} size={32} />
            ) : (
              <>
                {option.logoURI ? (
                  <Image src={option.logoURI} alt={option.logoURI} height={32} width={32} />
                ) : (
                  <TokenImage token={option.symbol as ExistingAsset} size={32} />
                )}
              </>
            )}
          </>

          <div className="flex flex-col items-start justify-start">
            <span className="text-sm font-semibold">{option.symbol}</span>
            <span className="text-xs text-subtitle">{formatAddress(option?.address, 4)}</span>
          </div>
        </div>
        <span className="ml-auto text-xs text-subtitle">{formatBigInt(option.balance!, option.decimals!, 2)}</span>
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
            <p className="text-[15px]">
              Swap any asset for USG and other Tangent&apos;s assets, including Curve LPs and Wrapped Tangent Stablecoins. Learn more
            </p>
          </div>
        </ReliefCard>

        <div className="flex h-auto w-full flex-col justify-between gap-2 xl:w-1/2">
          <PointsCampaignLiveCard></PointsCampaignLiveCard>

          <ThreeCardRowWithMask
            contents={[
              { key: "USG Balance", value: formatBigInt(USGsUSGMetrics?.USGBalance || 0n, 18, 2) },
              { key: "sUSG Balance", value: formatBigInt(USGsUSGMetrics?.sUSGBalance || 0n, 18, 2) },
              { key: "Your Total Points", value: `${formatNumber(lpUserPoints?.lpTotalPoints + voteUserPoints?.voteTotalPoints, 0)} pts` },
            ]}
          ></ThreeCardRowWithMask>
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-center">
        <ReliefCard className="flex w-full max-w-[450px] flex-col items-center justify-center p-4">
          <BuySellInput
            depositAmount={depositWeiValue}
            depositSelect={<DepositAssetSelect options={computedAssets?.depositAssets} />}
            isLoading={isLoading || isSwapLoading}
            receiveSelect={<ReceiveAssetSelect options={computedAssets?.receiveAssets} />}
            labelDeposit={"You sell"}
            labelReceive={"You buy"}
            setIsBuying={setIsBuying}
            isBuying={isBuying}
            toggleTokensSwitch={toggleTokensSwitch}
            depositAsset={depositAssetInfo!}
            depositBalance={balanceAllowanceData?.balance ?? 0n}
            receiveAmount={receiveWeiValue}
            receiveAsset={receiveAssetInfo!}
            setMaxBalance={() => handleDepositChange(balanceAllowanceData?.balance)}
            onValueChange={handleDepositChange}
            onReceiveValueChange={handleReceiveChange}
            percentage={depositSliderPercent}
            setPercentage={setDepositSliderPercent}
          />

          <div className="mt-2 flex w-full items-end justify-end gap-2">
            <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
          </div>

          <div className="mt-2 flex w-full">
            <FormButtons
              actions={{
                handleApprove: actionApprove,
                handleProcess: actionSwap,
              }}
              connect={connect}
              formState={formState}
              labelProcess="Swap"
            />
          </div>
        </ReliefCard>
      </div>
    </>
  )
}
