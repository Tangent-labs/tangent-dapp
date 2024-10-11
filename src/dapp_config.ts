export type DappConfig = {
  /** Cache time for price in minutes  */
  defillamaCacheTime: number
}

export const dappConfig: DappConfig = {
  defillamaCacheTime: Number(process.env.DEFILLAMA_CACHE_TIME) || 10,
}
