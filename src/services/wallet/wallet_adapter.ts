import { Address, EIP1193Provider } from "viem"

/** Normalized wallet info emitted by any adapter */
export type WalletInfo = {
  label: string
  address: Address
  ens: string | null
  chainIdHex: string
  provider: EIP1193Provider
}

export type WalletSubscriber = (wallet: WalletInfo | null) => void

/**
 * Abstraction over wallet connection libraries.
 * Implement this interface for each library (web3-onboard, RainbowKit, etc.)
 */
export interface WalletAdapter {
  connect(): Promise<void>
  disconnect(): Promise<void>
  subscribe(cb: WalletSubscriber): () => void
}
