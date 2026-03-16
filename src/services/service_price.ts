"use client"

import { ADDR_TOKEN, TOKEN_ADDR } from "@/services/repo_asset_addresses"
import { AssetConfigKey } from "@/services/repo_asset_infos"
import { Address } from "viem"

type DefillamaTokenInfo = {
  decimals: number
  price: number
  symbol: string
  timestamp: number
}

type DefillamaCoins = {
  [key: string]: DefillamaTokenInfo
}

type DefillamaPriceData = {
  coins: DefillamaCoins
}

const _fetchAndReturnPrices = async (list: Address[]): Promise<Record<AssetConfigKey, number> | undefined> => {
  const param = `ethereum:${list.join(",ethereum:")}`
  const priceResponse = await fetch(`https://coins.llama.fi/prices/current/${param}?searchWidth=4h`)
  if (priceResponse.status === 200) {
    const responseData = (await priceResponse.json()) as DefillamaPriceData
    const prices = Object.entries(responseData.coins).reduce(
      (acc, [key, data]) => {
        const address = key.replace("ethereum:", "") as Address
        const assetKey = ADDR_TOKEN[address] as AssetConfigKey
        acc[assetKey] = data.price
        return acc
      },
      {} as Record<AssetConfigKey, number>
    )
    return prices
  }
}

/**
 *
 * @param tokens only returns the price of some selected tokens
 * @returns
 */
export const getTokensPrice = async (tokens: string[]) => {
  const selectedAddresses: Address[] = Object.entries(TOKEN_ADDR)
    .filter(([key]) => tokens.includes(key))
    .map(([, value]) => value)

  return _fetchAndReturnPrices(selectedAddresses)
}

/**
 *
 * @param tokens only returns the price of a selected token
 * @returns
 */
export const getSwapAssetPrice = async (address: Address) => {
  const priceResponse = await fetch(`https://coins.llama.fi/prices/current/ethereum:${address}?searchWidth=4h`)
  if (priceResponse.status === 200) {
    const responseData = (await priceResponse.json()) as DefillamaPriceData

    const price = Object.values(responseData.coins)[0]?.price

    return price
  }
  return null
}
