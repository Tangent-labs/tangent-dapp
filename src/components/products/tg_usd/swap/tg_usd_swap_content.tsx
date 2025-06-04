"use client"

import Image from "next/image"
import { BuySellInput } from "@/components/design_system/inputs/buy_sell_input"
import { useTgUsdSwapContext } from "./tg_usd_swap_context"
import CustomSelect from "@/components/design_system/inputs/custom_select"
import { ExistingAsset } from "@/types"
import TokenImage from "@/components/design_system/structure/token_image"
import { formatBigInt } from "@/lib/number_formatter"
import FormButtons from "@/components/design_system/form/form_actions"
import { DepositReceiveAsset } from "../tg_usd_type"

type AssetSelectProps = {
  options: DepositReceiveAsset[]
}

export default function TgUsdSwapContent() {
  const {
    setIsBuying,
    handleDepositChange,
    handleReceiveChange,
    setDepositAsset,
    setReceiveAsset,
    actionSwap,
    actionApprove,
    formState,
    computedAssets,
    isSwapLoading,
    depositAssetInfo,
    depositWeiValue,
    depositAsset,
    receiveAsset,
    isBuying,
    balances,
    isLoading,
    balanceAllowanceData,
    receiveWeiValue,
    receiveAssetInfo,
    depositSliderPercent,
    setDepositSliderPercent,
  } = useTgUsdSwapContext()

  const ReceiveAssetSelect = ({ options }: AssetSelectProps) => {
    if (!balances || !options) {
      return (
        <CustomSelect
          className="w-full min-w-40"
          template={AssetSelectTemplate}
          value={receiveAsset}
          options={[]}
          onChange={(v: string) => setReceiveAsset(v)}
        />
      )
    }

    return (
      <CustomSelect
        className="w-full min-w-40"
        template={AssetSelectTemplate}
        value={receiveAsset}
        options={options}
        onChange={(v: string) => setReceiveAsset(v)}
      />
    )
  }

  const DepositAssetSelect = ({ options }: AssetSelectProps) => {
    if (!balances) {
      return (
        <CustomSelect
          className="w-full min-w-40"
          template={AssetSelectTemplate}
          value={depositAsset || ""}
          options={[]}
          onChange={(v: string) => setDepositAsset(v)}
        />
      )
    }

    return (
      <CustomSelect
        className="w-full min-w-40"
        template={AssetSelectTemplate}
        value={depositAsset || ""}
        options={options}
        onChange={(v: string) => setDepositAsset(v)}
      />
    )
  }

  const AssetSelectTemplate = (option: {
    logoURI?: string
    logo?: ExistingAsset
    value: string
    name?: string
    symbol: string
    balance?: bigint
    decimals?: number
  }) => {
    return (
      <div className="flex w-full min-w-48 items-center justify-between">
        <div className="flex w-full items-center gap-2">
          {option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={20} width={20} /> : <TokenImage token={option.logo} size={32} />}
          <span className="text-sm font-bold">{option.symbol}</span>
        </div>

        <span className="ml-auto text-xs text-gray-400">{formatBigInt(option.balance!, option.decimals!, 2)}</span>
      </div>
    )
  }

  return (
    <>
      <div className="sgusd-card relative w-7/12">
        <div className="absolute -top-2 left-20 h-full min-h-24">
          <Image height={140} width={140} src="/medias/tokens/swapLogo.png" alt="token" />
        </div>

        <Image className="mr-24 mt-5" height={140} width={140} src="/medias/tokens/tgUSD_header.png" alt="token" />

        <div className="flex flex-col items-start justify-center gap-3">
          <span className="text-5xl font-bold">Swap</span>
          <p>Swap any asset for tgUSD and other Tangent&apos;s assets, including Curve LPs and Wrapped Tangent Stablecoins. Learn more</p>
        </div>
      </div>

      <div className="mt-2 flex w-full flex-col items-center justify-center">
        <div className="mt-2 flex flex-col items-center justify-center rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
          <BuySellInput
            depositAmount={depositWeiValue}
            depositSelect={<DepositAssetSelect options={computedAssets?.depositAssets} />}
            disabled={false}
            isLoading={isLoading || isSwapLoading}
            receiveSelect={<ReceiveAssetSelect options={computedAssets?.receiveAssets} />}
            labelDeposit={"You Sell"}
            labelReceive={"You Buy"}
            setIsBuying={setIsBuying}
            isBuying={isBuying}
            depositAsset={depositAssetInfo!}
            depositBalance={balanceAllowanceData?.balance ?? 0n}
            receiveAmount={receiveWeiValue}
            receiveAsset={receiveAssetInfo!}
            setMaxBalance={() => {}}
            onValueChange={handleDepositChange}
            onTangentValueChange={handleReceiveChange}
            percentage={depositSliderPercent}
            setPercentage={setDepositSliderPercent}
          />

          <div className="mt-2 flex w-full">
            <FormButtons
              actions={{
                handleApprove: actionApprove,
                handleProcess: actionSwap,
              }}
              formState={formState}
              labelProcess="Swap"
            />
          </div>
        </div>
      </div>
    </>
  )
}
