import { dappConfig } from "@/dapp_config"
import injectedModule from "@web3-onboard/injected-wallets"
import walletConnectModule from "@web3-onboard/walletconnect"
import safeModule from "@web3-onboard/gnosis"
import ledgerModule, { LedgerOptionsWCv2 } from "@web3-onboard/ledger"
import { toHex } from "viem"
import init, { OnboardAPI } from "@web3-onboard/core"

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

const chains = [chain]

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
  chains,
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

export default web3Onboard as OnboardAPI
