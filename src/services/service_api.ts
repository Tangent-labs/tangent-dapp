import { dappConfig } from "@/dapp_config"
import { Apr } from "@/types"
import { revalidateTag, unstable_cache } from "next/cache"

const CACHE_APR_TAG = "tgt-apr"
const CACHE_APR_OPTION = { revalidate: dappConfig.cacheTime.apr * 60 }

export const resetAprCache = () => {
  revalidateTag(CACHE_APR_TAG)
}

export const getApr = unstable_cache(
  async () => {
    return _getApr()
  },
  [CACHE_APR_TAG],
  CACHE_APR_OPTION
)

export const _getApr = async () => {
  return (await _callApi<Apr>("aprs")) as Apr
}

const _callApi = async <T>(query: string) => {
  const url = `${dappConfig.apiUrl}/${query}`
  const response = await fetch(url)
  if (response.status !== 200) {
    throw new Error(`API request ${url} failed with status ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  return data as T
}
