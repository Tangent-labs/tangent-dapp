"use client"

import { assetConfig, AssetConfigKey } from "@/services/repo_asset_infos"
import { AssetDataPriced, AssetData } from "@/types"
import { Address } from "viem"
import { getPrices } from "@/services/service_price"

interface Market {
  marketAddress: Address
  collatName: string
  collatAddress: Address
  marketType: string
}

const addressesJson = process.env.NEXT_PUBLIC_ADDRESSES_JSON

if (!addressesJson) {
  throw new Error("NEXT_PUBLIC_ADDRESSES_JSON is not defined in the environment variables.")
}

const envAddresses: { markets: Market[] } = JSON.parse(addressesJson)

export const getAssetInfo = async (keys: AssetConfigKey[]): Promise<AssetDataPriced[]> => {
  const prices = await getPrices()
  const list: Record<AssetConfigKey, AssetData> = assetConfig

  return Object.entries(list)
    .filter(([k]) => keys.indexOf(k as AssetConfigKey) !== -1)
    .map(([k, config]) => {
      if (k === "USG") {
        return {
          ...config,
          price: (prices ? prices[k as AssetConfigKey] : 0) || 0,
        }
      } else {
        const market = envAddresses.markets.find((m) => m.collatName.replaceAll("_", "-") === k)
        if (!market) {
          throw new Error(`Market not found for collatName: ${k}`)
        }
        return {
          ...config,
          address: market.collatAddress,
          marketAddress: market.marketAddress,
          collatName: market.collatName,
          collatAddress: market.collatAddress,
          marketType: market.marketType,
          price: prices ? prices[k] || 0 : 0,
        }
      }
    })
}
