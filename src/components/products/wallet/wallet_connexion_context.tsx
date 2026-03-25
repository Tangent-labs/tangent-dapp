"use client"

import { dappConfig } from "@/dapp_config"
import { chain } from "@/services/service_rpc"
import { registerUser } from "./register_user"
import { createAdapter } from "@/services/wallet"
import type { WalletInfo } from "@/services/wallet"
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
  const [currentWallet, setCurrentWallet] = useState<WalletInfo | null>(null)
  const [currentAccount, setCurrentAccount] = useState<Account | undefined>(undefined)
  const [userBalances, setUserBalances] = useState<Array<{ balance: bigint; token: string; address: Address }>>([])
  const hasReceivedFirstUpdate = useRef(false)
  const lastRegisteredAddress = useRef<Address | undefined>(undefined)
  const [adapter] = useState(() => {
    if (typeof window === "undefined") return null
    return createAdapter()
  })

  useEffect(() => {
    if (!adapter) return

    const unsubscribe = adapter.subscribe((wallet) => {
      // A wallet connected → trust immediately
      if (wallet) {
        hasReceivedFirstUpdate.current = true
        clearTimeout(timeout)

        setCurrentWallet(wallet)
        setCurrentAccount({ address: wallet.address, ens: wallet.ens })
        setWalletStatus("connected")
        if (lastRegisteredAddress.current !== wallet.address) {
          lastRegisteredAddress.current = wallet.address
          void registerUser(wallet.address)
        }
        return
      }

      // Null BUT we already had a connection before → real disconnect
      if (hasReceivedFirstUpdate.current) {
        setCurrentWallet(null)
        setCurrentAccount(undefined)
        setWalletStatus("disconnected")
        lastRegisteredAddress.current = undefined
        return
      }

      // Null and never connected yet → ignore, let the timeout decide
    })

    // If nothing connects within 2s, it's a real disconnect
    const timeout = setTimeout(() => {
      if (!hasReceivedFirstUpdate.current) {
        hasReceivedFirstUpdate.current = true
        setWalletStatus("disconnected")
      }
    }, 2000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  // ─── Derived state ───
  const isConnected = walletStatus === "connected"

  const isChainConnected = useMemo(() => currentWallet?.chainIdHex === toHex(dappConfig.chain.id), [currentWallet])

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
    await adapter?.connect()
  }

  const disconnect = async () => {
    if (!currentWallet) return
    await adapter?.disconnect()
  }

  const changeNetwork = async () => {
    if (!currentWallet) return
    await adapter?.switchChain(dappConfig.chain.id)
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
