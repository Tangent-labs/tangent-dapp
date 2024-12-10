import { ADDR_TOKEN, TOKEN_ADDR } from "@/services/repo_asset_addresses"
import { assetConfig, AssetConfigKey } from "@/services/repo_asset_infos"
import { AssetDataPriced, AssetData, ExistingAsset } from "@/types"
import { Address } from "viem"
import { getPrices } from "@/services/service_price"

export const getAssetInfoByAddress = (address: Address): AssetData | undefined => {
  const key = ADDR_TOKEN[address]
  if (key) return getAssetInfoByKey(key as ExistingAsset)
}

export const getAssetInfoByKey = (key: ExistingAsset): AssetData | undefined => {
  if (TOKEN_ADDR[key]) {
    return assetConfig[key]
  }
  // Handle dev time token here
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
      .filter(([k]) => keys.indexOf(k as AssetConfigKey) !== -1)
      .map(([k, v]) => {
        return {
          ...v,
          price: (prices ? prices[k as AssetConfigKey] : 0) || 0,
        }
      })
      .sort((a, b) => {
        // we sort by the  index of the input array
        return (a?.logo ? keys.indexOf(a.logo) : -1) - (b?.logo ? keys.indexOf(b.logo) : -1)
      })
  )
}
