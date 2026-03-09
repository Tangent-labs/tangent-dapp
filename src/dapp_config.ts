export type DappConfig = {
  /** Cache time for price in minutes  */
  cacheTime: {
    price: number
    apr: number
  }
  keyPaths: Record<string, string>
  dappUrl: string
  chain: {
    id: number
    name: string
    rpc: string
    fallbackRpcs: string[]
    walletConnectId: string
    explorerContractUrl: string
  }
  apiUrl: string
}

export const dappConfig: DappConfig = {
  cacheTime: {
    price: 30,
    apr: 10,
  },
  keyPaths: {
    navIsOpen: "tgt.nav.isOpen",
  },
  dappUrl: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
  chain: {
    id: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
    name: process.env.NEXT_PUBLIC_CHAIN_NAME || "",
    rpc: process.env.NEXT_PUBLIC_CHAIN_RPC || "",
    fallbackRpcs: process.env.NEXT_BACKUP_RPCS?.split(",") || [],
    walletConnectId: process.env.NEXT_PUBLIC_WALLETCONECT_ID || "",
    explorerContractUrl: process.env.NEXT_PUBLIC_CHAIN_CONTRACT_EXPLORER || "",
  },
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "",

}
