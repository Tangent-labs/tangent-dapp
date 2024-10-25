export type DappConfig = {
  /** Cache time for price in minutes  */
  defillamaCacheTime: number
  keyPaths: Record<string, string>
}

export const dappConfig: DappConfig = {
  defillamaCacheTime: Number(process.env.DEFILLAMA_CACHE_TIME) || 10,
  keyPaths: {
    navIsOpen: "tgt.nav.isOpen",
  },
}
