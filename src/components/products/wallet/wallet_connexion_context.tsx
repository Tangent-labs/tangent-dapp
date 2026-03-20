"use client"

import { dappConfig } from "@/dapp_config"
import { chain } from "@/services/service_rpc"
import { registerUser } from "./register_user"
import { WalletState } from "@web3-onboard/core"
import web3Onboard from "@/services/config_wallet_provider"
import { getUserBalances } from "./wallet_connexion_controller"
import { Address, createWalletClient, custom, toHex, WalletClient, zeroAddress } from "viem"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

export type Account = {
  address: Address
  ens: string | null
}

type WalletStatus = "loading" | "disconnected" | "connected"

export type WalletConnexionContextValues = {
  walletStatus: WalletStatus
  isConnected: boolean
  isChainConnected: boolean
  isWellConnected: boolean
  currentAccount?: Account
  currentWallet?: WalletState
  currentAddress: Address
  connect: () => void
  disconnect: () => void
  changeNetwork: () => void
  walletClient: WalletClient | undefined
  canInteract: boolean
  userBalances: Array<{ balance: bigint; token: string; address: Address }>
  tokenInfo: (t: string) => { balance: bigint; token: string; address: Address } | undefined
  isWalletContextLoaded: boolean
}

const WalletConnexionContext = createContext<WalletConnexionContextValues | undefined>(undefined)

export const WalletConnexionProvider = ({ children }: { children: ReactNode }) => {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>("loading")
  const [currentWallet, setCurrentWallet] = useState<WalletState | undefined>(undefined)
  const [currentAccount, setCurrentAccount] = useState<Account | undefined>(undefined)
  const [userBalances, setUserBalances] = useState<Array<{ balance: bigint; token: string; address: Address }>>([])
  const hasReceivedFirstUpdate = useRef(false)

  useEffect(() => {
    const wallets$ = web3Onboard.state.select("wallets")

    const subscription = wallets$.subscribe({
      next: (wallets: WalletState[]) => {
        // A wallet connected → trust immediately
        if (wallets.length > 0) {
          hasReceivedFirstUpdate.current = true
          clearTimeout(timeout)

          const wallet = wallets[0]
          const account = wallet.accounts[0] as unknown as Account

          setCurrentWallet(wallet)
          setCurrentAccount(account)
          setWalletStatus("connected")
          registerUser(account.address)
          return
        }

        // Empty array BUT we already had a connection before → real disconnect
        if (hasReceivedFirstUpdate.current) {
          setCurrentWallet(undefined)
          setCurrentAccount(undefined)
          setWalletStatus("disconnected")
          return
        }

        // Empty array and never connected yet → ignore, let the timeout decide
      },
      error: (err: Error) => console.error("Wallet subscription error:", err),
    })

    // If nothing connects within 2s, it's a real disconnect
    const timeout = setTimeout(() => {
      if (!hasReceivedFirstUpdate.current) {
        hasReceivedFirstUpdate.current = true
        setWalletStatus("disconnected")
      }
    }, 2000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  // ─── Derived state ───
  const isConnected = walletStatus === "connected"

  const isChainConnected = useMemo(() => currentWallet?.chains?.at(0)?.id === toHex(dappConfig.chain.id), [currentWallet])

  const currentAddress = currentAccount?.address ?? zeroAddress

  const isWellConnected = isConnected && isChainConnected

  const isWalletContextLoaded = walletStatus !== "loading"

  const canInteract = currentAddress !== zeroAddress && isWellConnected

  const walletClient = useMemo(() => {
    if (!currentWallet || !currentAccount?.address) return undefined
    return createWalletClient({
      chain,
      transport: custom(currentWallet.provider),
      account: currentAccount.address,
    }) as WalletClient
  }, [currentWallet, currentAccount])

  // ─── Actions ───
  const connect = async () => {
    await web3Onboard.connectWallet()
    // subscription handles the rest
  }

  const disconnect = async () => {
    if (!currentWallet) return
    await web3Onboard.disconnectWallet({ label: currentWallet.label })
    // subscription handles the rest
  }

  const changeNetwork = () => {
    web3Onboard.setChain({ chainId: dappConfig.chain.id })
  }

  // ─── Balances ───
  useEffect(() => {
    if (currentAddress && currentAddress !== zeroAddress) {
      getUserBalances(currentAddress).then(setUserBalances)
    }
  }, [currentAddress])

  const tokenInfo = useCallback((t: string) => userBalances.find((el) => el.token === t), [userBalances])

  return (
    <WalletConnexionContext.Provider
      value={{
        walletStatus,
        currentAddress,
        currentAccount,
        currentWallet,
        isConnected,
        isChainConnected,
        isWellConnected,
        walletClient,
        connect,
        disconnect,
        changeNetwork,
        canInteract,
        userBalances,
        tokenInfo,
        isWalletContextLoaded,
      }}
    >
      {children}
    </WalletConnexionContext.Provider>
  )
}

export const useWalletConnexionContext = () => {
  const context = useContext(WalletConnexionContext)
  if (!context) {
    throw new Error("useWalletConnexionContext must be used within a WalletConnexionProvider")
  }
  return context
}
