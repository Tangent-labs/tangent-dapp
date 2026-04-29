"use client"

import { Address } from "viem"
import Image from "next/image"
import { ERC20S } from "@/data/erc20s"
import { TOKEN_INFOS } from "@/data/tokenInfos"
import { MarketDetailData } from "../../../usg_type"
import { useEffect, useMemo, useState } from "react"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { getTokensPrice, getTokensPriceChange } from "@/services/service_price"
import { MARKET_TYPE_TO_PLATFORMS, PLATFORM_INFOS, PlatformInfo } from "@/data/platformInfos"

type MarketDetailsInfosProps = {
  marketData: MarketDetailData
}

const LinkButton = ({ href, label }: { href: string; label: string }) => (
  <ReliefCard>
    <a href={href} target="_blank" rel="noopener noreferrer" className="block px-3 py-1 text-xs text-subtitle transition-colors hover:text-white">
      {label}
    </a>
  </ReliefCard>
)

const PlatformRow = ({ platform }: { platform: PlatformInfo }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center gap-1 rounded-full">
          <Image src={platform.logoPath} alt={platform.name} width={12} height={12} className="h-3 w-3" />
          <span className="text-xs text-white">{platform.name}</span>
        </div>
        <span className="rounded-full bg-overlay-panel px-2 py-1 text-xs text-white">{platform.type}</span>
      </div>
      <div className="flex items-center gap-2">
        <LinkButton href={platform.website} label="Website" />
        <LinkButton href={platform.twitter} label="Twitter" />
      </div>
    </div>
    <p className="text-xs leading-relaxed text-subtitle">{platform.description}</p>
  </div>
)

const AssetRow = ({ token, price, priceChange }: { token: string; price?: number; priceChange?: number }) => {
  const info = TOKEN_INFOS[token]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-1 rounded-full">
          <TokenImage token={token} size={16} className="h-4 w-4" />
          <span className="text-xs text-white">{token}</span>

          {!!price && !!priceChange && (
            <div className="flex items-center justify-center gap-1 rounded-full bg-overlay-panel px-2 py-1">
              <span className="text-xs text-subtitle">${price.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 4 })}</span>
              <span className={`text-xs ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        {info && (
          <div className="flex items-center gap-2">
            <LinkButton href={info.website} label="Website" />
            <LinkButton href={info.docs} label="Docs" />
          </div>
        )}
      </div>
      <p className="text-xs leading-relaxed text-subtitle">{info?.info ?? "No information available."}</p>
    </div>
  )
}

export const MarketDetailsInfos = ({ marketData }: MarketDetailsInfosProps) => {
  const tokens = useMemo(() => {
    // Pendle PT names are formatted as "<underlying> DD/MM/YY" — extract just the underlying
    if (marketData.marketType === "Pendle_PT") {
      return [marketData.collateralInfo.name.split(" ")[0]]
    }
    return marketData.collateralInfo.name.split("/").filter(Boolean)
  }, [marketData.collateralInfo.name, marketData.marketType])

  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({})
  const [tokenPriceChanges, setTokenPriceChanges] = useState<Record<string, number>>({})

  useEffect(() => {
    const addressBySymbol = Object.fromEntries(
      tokens.flatMap((symbol) => {
        const addr = ERC20S.find((e) => e.symbol === symbol)?.address
        return addr ? [[symbol, addr]] : []
      })
    ) as Record<string, Address>

    const addresses = Object.values(addressBySymbol)
    if (addresses.length === 0) return

    const toBySymbol = (prices: Record<Address, number>) => {
      const bySymbol: Record<string, number> = {}
      tokens.forEach((symbol) => {
        const addr = addressBySymbol[symbol]
        if (addr && prices[addr] !== undefined) bySymbol[symbol] = prices[addr]
      })
      return bySymbol
    }

    Promise.all([getTokensPrice(addresses), getTokensPriceChange(addresses)]).then(([prices, changes]) => {
      if (prices) setTokenPrices(toBySymbol(prices))
      if (changes) setTokenPriceChanges(toBySymbol(changes))
    })
  }, [tokens])

  const platforms = useMemo(() => {
    if (!marketData.marketType) return []
    return (MARKET_TYPE_TO_PLATFORMS[marketData.marketType] ?? []).map((name) => PLATFORM_INFOS[name])
  }, [marketData.marketType])

  return (
    <ReliefCard className="hidden w-full p-5 md:flex">
      <div className="flex w-1/2 flex-col border-r border-white/10 pr-5">
        <span className="mb-4 text-base font-semibold text-white">Platform</span>
        <div className="flex flex-col gap-5">
          {platforms.map((platform) => (
            <PlatformRow key={platform.name} platform={platform} />
          ))}
          {platforms.length === 0 && <span className="text-xs text-subtitle">No platform information available.</span>}
        </div>
      </div>

      <div className="flex w-1/2 flex-col pl-5">
        <span className="mb-4 text-base font-semibold text-white">Assets</span>
        <div className="flex flex-col gap-5">
          {tokens.map((token) => (
            <AssetRow key={token} token={token} price={tokenPrices[token]} priceChange={tokenPriceChanges[token]} />
          ))}
        </div>
      </div>
    </ReliefCard>
  )
}
