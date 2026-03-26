import { dappConfig } from "@/dapp_config"
import { chain } from "@/services/service_rpc"
import { createAppKit } from "@reown/appkit"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { getConnection, getConnections, watchConnections } from "@wagmi/core"
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
    themeVariables: {
      "--apkt-font-family": "Gilroy, sans-serif",
    },
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

    subscribe(cb: WalletSubscriber): () => void {
      const emitCurrentState = async () => {
        const { isConnected, address, chainId } = getConnection(wagmiAdapter.wagmiConfig)

        if (isConnected && address && chainId) {
          const connection = getConnections(wagmiAdapter.wagmiConfig).find((item) =>
            item.accounts.some((accountAddress) => accountAddress.toLowerCase() === address.toLowerCase())
          )
          const provider = (await connection?.connector?.getProvider?.()) as EIP1193Provider | undefined
          if (!provider) {
            cb(null)
            return
          }
          cb({
            label: "AppKit",
            address: getAddress(address),
            ens: null,
            chainIdHex: toHex(chainId),
            provider,
          })
        } else {
          cb(null)
        }
      }

      void emitCurrentState()

      const unwatchAccount = watchConnections(wagmiAdapter.wagmiConfig, {
        onChange: () => {
          void emitCurrentState()
        },
      })
      const unsubNetwork = appKit.subscribeNetwork(() => {
        void emitCurrentState()
      })

      return () => {
        unwatchAccount()
        unsubNetwork()
      }
    },
  }
}
