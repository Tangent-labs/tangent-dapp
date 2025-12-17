"use client"

import Image from "next/image"
import { Address, zeroAddress } from "viem"
import TokenImage from "../structure/token_image"
import { CollateralInfo, ExistingAsset } from "@/types"
import AssetSelectionDialog from "./asset-select-dialog"
import { formatAddress } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { useUSGRecordContext } from "@/components/products/usg/record/usg_record_context"
import { ZapToken } from "@/components/products/usg/usg_type"

type AssetSelectProps = {
  collateralInfo: CollateralInfo
  depositAsset: string
  setDepositAsset: (s: string) => void
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
              {!!option.logoURI && option.logoURI !== "" ? (
                <Image src={option.logoURI} alt={option.logoURI} height={32} width={32} />
              ) : (
                <TokenImage token={option.logo} size={32} />
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

export const AssetSelector = ({ collateralInfo, depositAsset, setDepositAsset }: AssetSelectProps) => {
  const { marketData, marketInfo } = useUSGRecordContext()

  const { tokens, balances } = useUSGContext()

  if (!!marketData) {
    const tokenOptions = tokens.map((el: ZapToken) => ({
      ...el,
      value: el.name as string,
      address: el.address as Address,
      balance: balances ? balances[el.address] : BigInt(0),
    }))

    const sortedAssets = [
      {
        ...collateralInfo,
        value: collateralInfo.name as string,
        address: collateralInfo.address as Address,
        balance: balances ? balances[marketInfo?.collatAddress] : BigInt(0),
      },
      ...[
        {
          symbol: "ETH",
          name: "Ethereum",
          value: "ETH",
          decimals: 18,
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address,
          logo: "ETH" as ExistingAsset,
          displayDecimals: 5,
          balance: balances ? balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] : BigInt(0),
        },
        ...tokenOptions,
      ].sort((a, b) => Number(b.balance) - Number(a.balance)),
    ]

    if (marketData?.constants?.receipt !== zeroAddress) {
      const gaugeSymbol = `Gauge ${collateralInfo?.symbol}`

      sortedAssets.unshift({
        decimals: 18,
        displayDecimals: 5,
        logo: collateralInfo?.logo as ExistingAsset,
        symbol: gaugeSymbol,
        name: gaugeSymbol,
        address: marketData?.constants?.receipt as Address,
        value: gaugeSymbol,
        balance: balances?.[marketData?.constants?.receipt] ?? BigInt(0),
      })
    }

    return (
      <AssetSelectionDialog
        className="w-full min-w-24"
        template={AssetSelectTemplate}
        value={depositAsset}
        options={sortedAssets}
        onChange={(v: string) => setDepositAsset(v)}
      />
    )
  }
}
