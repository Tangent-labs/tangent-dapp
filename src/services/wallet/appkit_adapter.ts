import { dappConfig } from "@/dapp_config"
import { chain } from "@/services/service_rpc"
import { createAppKit, type AppKit } from "@reown/appkit"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import type { EIP1193Provider } from "viem"
import { toHex } from "viem"
import type { WalletAdapter, WalletSubscriber } from "./wallet_adapter"

export function createAppKitAdapter(): WalletAdapter {
  const projectId = dappConfig.chain.walletConnectId

  const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: [chain],
  })

  const appKit = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [chain],
    defaultNetwork: chain,
    metadata: {
      name: "Tangent",
      description: "Borrow USG against productive collateral",
      url: dappConfig.dappUrl || window.location.origin,
      icons: [],
    },
    themeMode: "dark",
    features: {
      analytics: false,
    },
  })

  return {
    async connect() {
      await appKit.open()
    },

    async disconnect() {
      await appKit.disconnect()
    },

    async switchChain(chainId: number) {
      const network = appKit.getCaipNetworks("eip155").find((n) => n.id === chainId)
      if (network) {
        await appKit.switchNetwork(network)
      }
    },

    subscribe(cb: WalletSubscriber): () => void {
      const unsubAccount = appKit.subscribeAccount((account) => {
        if (account.isConnected && account.address) {
          const provider = appKit.getProvider<EIP1193Provider>("eip155")
          const caipNetwork = appKit.getCaipNetwork()
          cb({
            label: "AppKit",
            address: account.address as `0x${string}`,
            ens: null,
            chainIdHex: caipNetwork?.id ? toHex(Number(caipNetwork.id)) : "0x0",
            provider: provider!,
          })
        } else {
          cb(null)
        }
      }, "eip155")

      return unsubAccount
    },
  }
}
