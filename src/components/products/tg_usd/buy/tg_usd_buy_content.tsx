"use client"

import Image from "next/image"
import { BuySellInput } from "@/components/design_system/inputs/buy_sell_input"
import { useTgUsdBuyContext } from "./tg_usd_buy_context"
import CustomSelect from "@/components/design_system/inputs/custom_select"
import { ExistingAsset } from "@/types"
import { ZapToken } from "../tg_usd_type"
import TokenImage from "@/components/design_system/structure/token_image"
import { tgUsdTokens } from "../tg_usd_repository"
import { formatBigInt } from "@/lib/number_formatter"
import { Address } from "viem"
import FormButtons from "@/components/design_system/form/form_actions"

export default function TgUsdBuyContent() {
  const {
    setIsBuying,
    handleDepositChange,
    handleReceiveChange,
    setDepositAsset,
    setReceiveAsset,
    actionSwap,
    actionApprove,
    formState,
    depositAssetInfo,
    depositWeiValue,
    depositAsset,
    receiveAsset,
    tokens,
    isBuying,
    balances,
    isLoading,
    balanceAllowanceData,
    receiveWeiValue,
    receiveAssetInfo,
  } = useTgUsdBuyContext()

  const ReceiveAssetSelect = () => {
    if (!balances) {
      return (
        <CustomSelect className="w-full min-w-40" template={AssetSelectTemplate} value={"tgUSD"} options={[]} onChange={(v: string) => setReceiveAsset(v)} />
      )
    }

    const tgTokens = Object.entries(tgUsdTokens).flatMap(([, tokens]) => {
      return Object.entries(tokens).map(([name, address]) => ({
        name,
        symbol: name,
        value: name,
        address,
        balance: balances[address as Address] || BigInt(0),
      }))
    })

    const tokenOptions = tokens.map((el: ZapToken) => ({
      ...el,
      value: el.name as string,
      balance: balances[el.address] || BigInt(0),
    }))

    const sortedAssets = [
      ...tgTokens,
      ...[
        {
          symbol: "ETH",
          name: "Ethereum",
          value: "ETH",
          decimals: 18,
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          logo: "ETH" as ExistingAsset,
          displayDecimals: 5,
          balance: balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] || BigInt(0),
        },
        ...tokenOptions,
      ].sort((a, b) => Number(b.balance - a.balance)),
    ]

    return (
      <CustomSelect
        className="w-full min-w-40"
        template={AssetSelectTemplate}
        value={receiveAsset || "tgUSD"}
        options={sortedAssets}
        onChange={(v: string) => setReceiveAsset(v)}
      />
    )
  }

  const DepositAssetSelect = () => {
    if (!balances) {
      return <CustomSelect className="w-full min-w-40" template={AssetSelectTemplate} value={"ETH"} options={[]} onChange={(v: string) => setDepositAsset(v)} />
    }

    const tgTokens = Object.entries(tgUsdTokens).flatMap(([, tokens]) =>
      Object.entries(tokens).map(([name, address]) => ({
        name,
        symbol: name,
        value: name,
        address,
        balance: balances[address as Address] || BigInt(0),
      }))
    )

    const tokenOptions = tokens.map((el: ZapToken) => ({
      ...el,
      value: el.name as string,
      balance: balances[el.address] || BigInt(0),
    }))

    const sortedAssets = [
      ...[
        {
          symbol: "ETH",
          name: "Ethereum",
          value: "ETH",
          decimals: 18,
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          logo: "ETH" as ExistingAsset,
          displayDecimals: 5,
          balance: balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] || BigInt(0),
        },
        ...tokenOptions,
        ...tgTokens,
      ].sort((a, b) => Number(b.balance - a.balance)),
    ]

    return (
      <CustomSelect
        className="w-full min-w-40"
        template={AssetSelectTemplate}
        value={depositAsset || "ETH"}
        options={sortedAssets}
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
          <span className="text-4xl">Buy</span>
          <p>
            Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools (SDT
            stable pool & CVX stable pool).
          </p>
          <p>Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs. Learn more</p>
        </div>
      </div>

      <div className="mt-2 flex w-full flex-col items-center justify-center">
        <BuySellInput
          className={`${isBuying ? " " : "!flex-col-reverse"}`}
          depositAmount={depositWeiValue}
          depositSelect={<DepositAssetSelect />}
          disabled={false}
          isLoading={isLoading}
          receiveSelect={<ReceiveAssetSelect />}
          labelDeposit={isBuying ? "You Sell" : "You Buy"}
          labelReceive={isBuying ? "You Buy" : "You Sell"}
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
