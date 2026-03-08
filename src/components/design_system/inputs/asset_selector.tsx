"use client"

import Image from "next/image"
import { Address, zeroAddress } from "viem"
import { TokenImage } from "../structure/token_image"
import { formatAddress } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { CollateralInfo, ExistingAsset } from "@/types"
import { ZapToken } from "@/components/products/usg/usg_type"
import { AssetSelectionDialog } from "./asset-select-dialog"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { useUSGRecordContext } from "@/components/products/usg/record/usg_record_context"

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
          <span className="text-sm font-semibold">{option.symbol?.replaceAll("-", "/")}</span>
          <span className="text-xs text-subtitle">{formatAddress(option?.address, 4)}</span>
        </div>
      </div>
      <span className="ml-auto text-xs text-subtitle">{formatBigInt(option.balance!, option.decimals!, 2)}</span>
    </div>
  )
}

const tokenOrder = ["ETH", "USDT", "USDC", "USDS", "USDe", "DAI", "frxUSD", "crvUSD", "DOLA", "reUSD", "fxUSD", "WETH", "WBTC"]

type PrioritySymbol = (typeof tokenOrder)[number]

// Return the index of the token in the ordered list if it exists
const getTokenSymbolPriorityIndex = (symbol: string): number => {
  const idx = tokenOrder.indexOf(symbol as PrioritySymbol)
  return idx === -1 ? tokenOrder?.length + 1 : idx
}

export const AssetSelector = ({ collateralInfo, depositAsset, setDepositAsset }: AssetSelectProps) => {
  const { marketData, marketInfo } = useUSGRecordContext()

  const { tokens, balances } = useUSGContext()

  if (!!marketData) {
    const tokenOptions = tokens
      .map((el: ZapToken) => ({
        ...el,
        value: el.name as string,
        address: el.address as Address,
        balance: balances ? balances[el.address] : BigInt(0),
      }))
      .sort((a, b) => {
        const aPriority = getTokenSymbolPriorityIndex(a.symbol)
        const bPriority = getTokenSymbolPriorityIndex(b.symbol)

        if (Number(a.balance) > 0 !== Number(b.balance) > 0) {
          return Number(a.balance) > 0 ? -1 : 1
        } else if (aPriority !== bPriority) {
          return aPriority - bPriority
        } else {
          return Number(b.balance) - Number(a.balance)
        }
      })

    const allAssets = [
      {
        ...collateralInfo,
        value: collateralInfo.name as string,
        address: collateralInfo.address as Address,
        balance: balances ? balances[marketInfo?.collatAddress] : BigInt(0),
      },
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
    ]

    if (marketData?.constants?.receipt !== zeroAddress) {
      const gaugeSymbol = `Gauge ${collateralInfo?.symbol}`

      allAssets.unshift({
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
        options={allAssets}
        onChange={(v: string) => setDepositAsset(v)}
      />
    )
  }
}
