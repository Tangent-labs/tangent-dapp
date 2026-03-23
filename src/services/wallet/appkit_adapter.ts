import { dappConfig } from "@/dapp_config"
import { chain } from "@/services/service_rpc"
import { createAppKit } from "@reown/appkit"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import type { EIP1193Provider } from "viem"
import { getAddress, toHex } from "viem"
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
      const emitCurrentState = () => {
        const account = appKit.getAccount("eip155")
        if (account?.isConnected && account?.address) {
          const provider = appKit.getProvider<EIP1193Provider>("eip155")
          if (!provider) {
            cb(null)
            return
          }
          const caipNetwork = appKit.getCaipNetwork()
          if (!caipNetwork?.id) {
            cb(null)
            return
          }
          cb({
            label: "AppKit",
            address: getAddress(account.address),
            ens: null,
            chainIdHex: toHex(Number(caipNetwork.id)),
            provider,
          })
        } else {
          cb(null)
        }
      }

      const unsubAccount = appKit.subscribeAccount(() => emitCurrentState(), "eip155")
      const unsubNetwork = appKit.subscribeNetwork(() => emitCurrentState())

      return () => {
        unsubAccount()
        unsubNetwork()
      }
    },
  }
}
