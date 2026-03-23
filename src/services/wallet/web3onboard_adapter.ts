import { dappConfig } from "@/dapp_config"
import { toHex } from "viem"
import injectedModule from "@web3-onboard/injected-wallets"
import walletConnectModule from "@web3-onboard/walletconnect"
import safeModule from "@web3-onboard/gnosis"
import ledgerModule, { LedgerOptionsWCv2 } from "@web3-onboard/ledger"
import init from "@web3-onboard/core"
import type { WalletState } from "@web3-onboard/core"
import type { WalletAdapter, WalletSubscriber } from "./wallet_adapter"

export function createWeb3OnboardAdapter(): WalletAdapter {
  const appMetadata = {
    name: "Tangent",
    description: "Borrow USG against productive collateral",
    recommendedInjectedWallets: [
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  }

  const chain = {
    id: typeof dappConfig.chain.id === "number" ? toHex(dappConfig.chain.id) : dappConfig.chain.id,
    token: "ETH",
    label: dappConfig.chain.name,
    rpcUrl: dappConfig.chain.rpc,
  }

  const wcV2InitOptions: Partial<LedgerOptionsWCv2> = {
    projectId: dappConfig.chain.walletConnectId,
    requiredChains: [dappConfig.chain.id],
  }

  const walletConnect = walletConnectModule({
    ...wcV2InitOptions,
    dappUrl: dappConfig.dappUrl || window.location.origin,
  })
  const safe = safeModule()
  const ledger = ledgerModule(wcV2InitOptions as unknown as LedgerOptionsWCv2)

  const wallets = [injectedModule(), walletConnect, safe, ledger]

  const web3Onboard = init({
    wallets,
    chains: [chain],
    appMetadata,
    notify: { enabled: false },
    theme: "dark",
    accountCenter: {
      desktop: { enabled: false },
      mobile: { enabled: false },
    },
    connect: {
      autoConnectLastWallet: true,
    },
  })

  return {
    async connect() {
      await web3Onboard.connectWallet()
    },

    async disconnect(label: string) {
      await web3Onboard.disconnectWallet({ label })
    },

    async switchChain(chainId: number) {
      await web3Onboard.setChain({ chainId })
    },

    subscribe(cb: WalletSubscriber): () => void {
      const wallets$ = web3Onboard.state.select("wallets")

      const subscription = wallets$.subscribe({
        next: (wallets: WalletState[]) => {
          if (wallets.length > 0) {
            const w = wallets[0]
            const account = w.accounts[0]
            cb({
              label: w.label,
              address: account.address as `0x${string}`,
              ens: (account as { ens?: string | null }).ens ?? null,
              chainIdHex: w.chains?.[0]?.id ?? "0x0",
              provider: w.provider as unknown as import("viem").EIP1193Provider,
            })
          } else {
            cb(null)
          }
        },
        error: (err: Error) => console.error("Wallet subscription error:", err),
      })

      return () => subscription.unsubscribe()
    },
  }
}
