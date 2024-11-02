import { ADDR_TOKEN, TOKEN_ADDR } from "@/services/repo_asset_addresses"
import { assetConfig, AssetConfigKey } from "@/services/repo_asset_infos"
import { AssetDataPriced, AssetData } from "@/types"
import { Address } from "viem"
import { getPrices } from "@/services/service_price"

export const getAssetInfoByAddress = (address: Address): AssetData | undefined => {
  const key = ADDR_TOKEN[address] ? ADDR_TOKEN[address] : address
  return getAssetInfoByKey(key)
}

export const getAssetInfoByKey = (key: string): AssetData | undefined => {
  if (TOKEN_ADDR[key]) {
    return assetConfig[key]
  }
  // Handle dev time token here
  return
}

export const getAssetInfoUnique = async (key: AssetConfigKey): Promise<AssetDataPriced | undefined> => {
  const data = await getAssetInfo([key])
  return data?.at(0)
}

export const getAssetInfo = async (keys: AssetConfigKey[]): Promise<AssetDataPriced[]> => {
  const list: Record<AssetConfigKey, AssetData> = assetConfig
  const prices = await getPrices()
  return (
    Object.entries(list)
      // Filter only the keys that are in the `keys` array
      .filter(([k]) => keys.includes(k as AssetConfigKey))
      .map(([k, v]) => {
        return {
          ...v,
          price: prices ? prices[k] : 0,
        }
      })
      .sort((a, b) => {
        // we sort by the  index of the input array
        return keys.indexOf(a.symbol) - keys.indexOf(b.symbol)
      })
  )
}
