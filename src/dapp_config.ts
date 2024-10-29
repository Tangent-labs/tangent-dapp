export type DappConfig = {
  /** Cache time for price in minutes  */
  defillamaCacheTime: number
  keyPaths: Record<string, string>
  dappUrl: string
  chain: {
    id: number
    name: string
    rpc: string
    walletConnectId: string
  }
}

export const dappConfig: DappConfig = {
  defillamaCacheTime: Number(process.env.DEFILLAMA_CACHE_TIME) || 10,
  keyPaths: {
    navIsOpen: "tgt.nav.isOpen",
  },
  dappUrl: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
  chain: {
    id: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
    name: process.env.NEXT_PUBLIC_CHAIN_NAME || "",
    rpc: process.env.NEXT_PUBLIC_CHAIN_RPC || "",
    walletConnectId: process.env.NEXT_PUBLIC_WALLETCONECT_ID || "",
  },
}
