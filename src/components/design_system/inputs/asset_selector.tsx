"use client"

import Image from "next/image"
import { Address, formatUnits, zeroAddress } from "viem"
import { TokenImage } from "../structure/token_image"
import { formatAddress } from "@/lib/other_formatter"
import { CollateralInfo } from "@/types"
import { AssetSelectionDialog } from "./asset-select-dialog"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { useUSGRecordContext } from "@/components/products/usg/record/usg_record_context"
import { useMemo } from "react"
import { formatNumber } from "@/lib/number_formatter"
import { Erc20Details, ERC20S } from "@/data/erc20s"
import { USG_CONTRACT } from "@/components/products/usg/usg_repository"

type AssetSelectProps = {
  collateralInfo: CollateralInfo
  depositAsset: string | undefined
  setDepositAsset: (s: string) => void
  caseType: "deposit" | "repay"
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
  logoURI?: string
  price?: number
  logoKey?: string
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
              <TokenImage token={option.logoKey} size={32} />
            )}
          </>
        </>

        <div className="flex flex-col items-start justify-start">
          <span className="text-sm font-semibold">{option.symbol}</span>
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

export const ZapAssetSelector = ({ collateralInfo, depositAsset, setDepositAsset, caseType }: AssetSelectProps) => {
  const { marketData } = useUSGRecordContext()

  const { balances } = useUSGContext()

  // Prepare and format all data to display in the Asset selector ( logo, balances, decimals, address ...)
  // Takes the static token list we have
  const allAssets: AssetInfos[] = useMemo(() => {
    const receiptAddress = marketData?.constants?.receipt !== zeroAddress ? marketData?.constants?.receipt?.toLowerCase() : undefined
    const collatAddress = collateralInfo?.address.toLowerCase()

    const assets = ERC20S.map((el: Erc20Details) => {
      const balWei = balances?.[el.address as Address] ?? 0n
      const balNumber = Number(formatUnits(balWei, el.decimals))
      const formattedBal = formatNumber(balNumber, el.displayDecimals ?? 2)
      const address = el.address.toLowerCase()

      let pinPriority = 2
      if (caseType === "deposit") {
        // Find receipt and collateral and pin them
        if (receiptAddress && address === receiptAddress) {
          pinPriority = 0
        } else if (address === collatAddress) {
          pinPriority = 1
        }
      } else if (caseType === "repay") {
        if (address === USG_CONTRACT.USG.toLowerCase()) {
          pinPriority = 0
        }
      }

      return {
        ...el,
        value: el.name as string,
        address: address as Address,
        balanceWei: balWei,
        balanceNumber: balNumber,
        balanceFormatted: formattedBal,
        pinPriority,
        displayDecimals: el.displayDecimals ?? 18,
        logoURI: el.logoURI,
      }
    }).sort((a, b) => {
      // Sort the Receipt first then the collateral
      if (a.pinPriority !== b.pinPriority) return a.pinPriority - b.pinPriority
      // Sort by balance then
      if (a.balanceNumber !== b.balanceNumber) return b.balanceNumber - a.balanceNumber
      // Finally sort per manual token order list
      return getTokenSymbolPriorityIndex(a.symbol) - getTokenSymbolPriorityIndex(b.symbol)
    })

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
