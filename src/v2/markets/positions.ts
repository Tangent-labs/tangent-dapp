"use client"

import { useMemo } from "react"
import { Address } from "viem"
import { useUSGMaketListContext } from "@/components/products/usg/list/usg_market_list_context"
import { USGMarkets } from "@/components/products/usg/usg_repository"
import { getCollateralDisplayDecimals, getComputedFutureLoanData, transformMarketData } from "@/components/products/usg/record/usg_record_controller"

/** Under this health a position is one price move from liquidation: the list flags it and the page shows an alert. */
export const HEALTH_AT_RISK = 1.1

export type PositionHealth = { health: number; label: string }

// one computation per data version, shared by every caller (the list header and each row's status chip)
let cache: { data?: object; price?: number; map?: Map<string, PositionHealth> } = {}

/**
 * Health of each market the wallet borrows on, from the rows the market list already loaded.
 * Runs the market page's own getComputedFutureLoanData (with no pending amounts), so the number is the one the market page shows.
 */
export function usePositionHealth() {
  const { onChainData, globalData } = useUSGMaketListContext()
  return useMemo(() => {
    const usgPrice = Number(globalData?.USGPrice)
    if (cache.map && cache.data === onChainData && cache.price === usgPrice) return cache.map
    const byMarket = new Map<string, PositionHealth>()
    if (!onChainData || !usgPrice) return byMarket
    for (const row of onChainData.rowInfos) {
      if (!(BigInt(row.debtInfos?.userDebt ?? 0n) > 0n)) continue
      const market = USGMarkets.find((m) => m.marketAddress.toLowerCase() === row.marketAddress.toLowerCase())
      if (!market) continue
      const collateralInfo = {
        address: market.collatAddress as Address,
        decimals: market.collatDecimals,
        symbol: market.marketName as string,
        name: market.marketName as string,
        logoKey: market.logoKey,
        displayDecimals: getCollateralDisplayDecimals(market.collatAddress as Address, market.marketName),
        price: 0,
      }
      const loan = getComputedFutureLoanData(usgPrice, transformMarketData(row, collateralInfo), collateralInfo)
      const health = parseFloat(String(loan.health).replace(/,/g, ""))
      if (Number.isFinite(health) && health > 0) byMarket.set(row.marketAddress.toLowerCase(), { health, label: loan.health })
    }
    cache = { data: onChainData, price: usgPrice, map: byMarket }
    return byMarket
  }, [onChainData, globalData?.USGPrice])
}
