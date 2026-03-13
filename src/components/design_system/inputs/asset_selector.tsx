"use client"

import Image from "next/image"
import { Address, formatUnits, zeroAddress } from "viem"
import { TokenImage } from "../structure/token_image"
import { formatAddress } from "@/lib/other_formatter"
import { CollateralInfo } from "@/types"
import { ZapToken } from "@/components/products/usg/usg_type"
import { AssetSelectionDialog } from "./asset-select-dialog"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { useUSGRecordContext } from "@/components/products/usg/record/usg_record_context"
import { useMemo } from "react"
import { formatNumber } from "@/lib/number_formatter"

type AssetSelectProps = {
  collateralInfo: CollateralInfo
  depositAsset: string
  setDepositAsset: (s: string) => void
}

export type AssetInfos = {
  value: string
  address: Address
  balanceWei: bigint
  balanceFormatted: string
  balanceNumber: number
  decimals: number
  displayDecimals: number
  symbol: string
  name?: string
  logo?: string
  price?: number
  logoURI?: string
  displaySymbol?: string
  chainId?: number
}

export const AssetSelectTemplate = (option: AssetInfos) => {
  return (
    <div className="flex w-full min-w-48 cursor-pointer items-center justify-between px-2 py-1 hover:rounded-full hover:bg-white/30">
      <div className="flex w-full items-center gap-2">
        <>
          <>
            {!!option.logoURI && option.logoURI !== "" ? (
              <Image src={option.logoURI} alt={option.logoURI} height={32} width={32} />
            ) : (
              <TokenImage token={option.logo} size={32} />
            )}
          </>
        </>

        <div className="flex flex-col items-start justify-start">
          <span className="text-sm font-semibold">{option.symbol?.replaceAll("-", "/")}</span>
          <span className="text-xs text-subtitle">{formatAddress(option?.address, 4)}</span>
        </div>
      </div>
      <span className="ml-auto text-xs text-subtitle">{option?.balanceFormatted}</span>
    </div>
  )
}

const tokenOrder = ["USG", "sUSG", "USDT", "USDC", "USDS", "USDe", "frxUSD", "crvUSD", "DOLA", "reUSD", "DAI", "ETH", "WETH", "fxUSD", "WBTC"]

type PrioritySymbol = (typeof tokenOrder)[number]

// Return the index of the token in the ordered list if it exists
export const getTokenSymbolPriorityIndex = (symbol: string): number => {
  const idx = tokenOrder.indexOf(symbol as PrioritySymbol)
  return idx === -1 ? tokenOrder?.length + 1 : idx
}

export const AssetSelector = ({ collateralInfo, depositAsset, setDepositAsset }: AssetSelectProps) => {
  const { marketData } = useUSGRecordContext()

  const { tokens, balances } = useUSGContext()

  // SORT THE ASSETS

  const allAssets = useMemo(() => {
    const assets = tokens
      .map((el: ZapToken) => {
        const balWei = balances?.[el.address] ?? 0n
        const balNumber = Number(formatUnits(balWei, el.decimals))
        const formattedBal = formatNumber(balNumber, el.displayDecimals ?? 2)
        return {
          ...el,
          value: el.name as string,
          address: el.address as Address,
          balanceWei: balWei,
          balanceNumber: balNumber,
          balanceFormatted: formattedBal,
        }
      })
      .sort((a, b) => {
        if (a.balanceNumber !== b.balanceNumber) {
          return b.balanceNumber - a.balanceNumber
        }
        return getTokenSymbolPriorityIndex(a.symbol) - getTokenSymbolPriorityIndex(b.symbol)
      })

    if (marketData) {
      // Add collateral token
      const collatBalWei = marketData.collateralBalance ?? 0n

      const collatBalNumber = Number(formatUnits(collatBalWei, collateralInfo.decimals))
      const collatBalFormatted = formatNumber(collatBalNumber, collateralInfo.displayDecimals ?? 2)
      assets.unshift({
        ...collateralInfo,
        value: collateralInfo.name,
        address: collateralInfo.address,
        balanceWei: collatBalWei,
        balanceNumber: collatBalNumber,
        balanceFormatted: collatBalFormatted,
        logoURI: "",
      })

      // Add Receipt token
      if (marketData.constants?.receipt !== zeroAddress) {
        let symbol = ""
        if (marketData?.marketType === "STAKEDAO_CRV_Vault") {
          symbol = `Vault ${collateralInfo?.symbol}`
        } else if (marketData?.marketType === "CRV_Gauge") {
          symbol = `Gauge ${collateralInfo?.symbol}`
        }

        const receiptBalWei = balances?.[marketData?.constants?.receipt] ?? 0n
        const receiptBalNumber = Number(formatUnits(receiptBalWei, collateralInfo.decimals))
        const formattedBal = formatNumber(receiptBalNumber, collateralInfo.displayDecimals ?? 2)
        assets.unshift({
          decimals: 18,
          displayDecimals: 5,
          logo: collateralInfo?.logo,
          symbol: symbol,
          name: symbol,
          address: marketData?.constants?.receipt,
          value: symbol,
          balanceWei: receiptBalWei,
          balanceNumber: receiptBalNumber,
          balanceFormatted: formattedBal,
          logoURI: "",
          price: collateralInfo.price,
        })
      }
    }

    return assets
  }, [balances, marketData?.constants?.receipt])

  return (
    <AssetSelectionDialog
      className="w-full min-w-24"
      template={AssetSelectTemplate}
      value={depositAsset}
      options={allAssets ?? []}
      onChange={(v: string) => setDepositAsset(v)}
    />
  )
}
