import { ADDR_TOKEN, TOKEN_ADDR } from "@/services/repo_asset_addresses"
import { AssetConfigKey } from "@/services/repo_asset_infos"
import { dappConfig } from "@/dapp_config"
import { Address } from "viem"
import { revalidateTag, unstable_cache } from "next/cache"

const CACHE_TAG = "tgt-defillama-price"
const CACHE_OPTION = { revalidate: dappConfig.defillamaCacheTime * 60 }

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

const _getPrice = async (): Promise<Record<AssetConfigKey, number> | undefined> => {
  const list = Object.values(TOKEN_ADDR)
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

export const resetPricesCache = () => {
  revalidateTag(CACHE_TAG)
}

export const getPrices = unstable_cache(
  async () => {
    return _getPrice()
  },
  [CACHE_TAG],
  CACHE_OPTION
)
