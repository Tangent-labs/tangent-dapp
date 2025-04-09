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
          {option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={16} width={16} /> : <TokenImage token={option.logo} size={16} />}
          <span className="text-sm font-bold">{option.symbol}</span>
        </div>

        <span className="ml-auto text-xs text-gray-400">{formatBigInt(option.balance!, option.decimals!, 2)}</span>
      </div>
    )
  }

  return (
    <>
      <div className="sgusd-card w-7/12">
        <div className="flex items-center justify-center">
          <Image height={440} width={440} className="an-logo" src="/medias/product_tgusd.png" alt="token" />
        </div>
        <div className="flex flex-col items-start justify-between gap-3">
          <span className="text-4xl">Swap</span>
          <p>
            Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools (SDT
            stable pool & CVX stable pool).
          </p>
          <p>Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs. Learn more</p>
        </div>
      </div>

      <div className="mt-2 flex w-full flex-col items-center justify-center">
        <BuySellInput
          depositAmount={depositWeiValue}
          depositSelect={<DepositAssetSelect options={computedAssets?.depositAssets} />}
          disabled={false}
          isLoading={isLoading}
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
        />

        <div className="flex w-full max-w-96">
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
    </>
  )
}
