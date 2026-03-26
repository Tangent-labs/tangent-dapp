"use client"

import { chain } from "@/services/service_rpc"
import { registerUser } from "./register_user"
import { createAdapter } from "@/services/wallet"
import type { WalletInfo } from "@/services/wallet"
import { getUserBalances } from "./wallet_connexion_controller"
import { Address, createWalletClient, custom, getAddress, WalletClient, zeroAddress } from "viem"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

export type Account = {
  address: Address
  ens: string | null
}

type WalletStatus = "loading" | "disconnected" | "connected"

export type WalletConnexionContextValues = {
  walletStatus: WalletStatus
  isConnected: boolean
  walletActionLabel: string
  currentAccount?: Account
  currentAddress: Address
  connect: () => void
  disconnect: () => void
  requestWalletAction: () => void
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

  useEffect(() => {
    if (!currentWallet?.provider) return

    let isCancelled = false

    const syncWalletState = async () => {
      try {
        const [chainIdHex, accounts] = await Promise.all([
          currentWallet.provider.request({ method: "eth_chainId" }) as Promise<string>,
          currentWallet.provider.request({ method: "eth_accounts" }) as Promise<string[]>,
        ])

        if (isCancelled) return

        const nextAddress = accounts?.[0] ? getAddress(accounts[0]) : undefined

        setCurrentWallet((prev) => {
          if (!prev) return prev

          const shouldUpdateAddress = !!nextAddress && prev.address !== nextAddress
          const shouldUpdateChain = prev.chainIdHex !== chainIdHex

          if (!shouldUpdateAddress && !shouldUpdateChain) return prev

          return {
            ...prev,
            address: nextAddress || prev.address,
            chainIdHex,
          }
        })

        if (!nextAddress) {
          setCurrentAccount(undefined)
          setWalletStatus("disconnected")
          return
        }

        setCurrentAccount((prev) => {
          if (prev?.address === nextAddress) return prev
          return { address: nextAddress, ens: null }
        })
        setWalletStatus("connected")
      } catch {
        // Adapter subscription remains the primary source; this effect is only a safety net.
      }
    }

    const handleProviderStateChange = () => {
      void syncWalletState()
    }

    currentWallet.provider.on?.("chainChanged", handleProviderStateChange)
    currentWallet.provider.on?.("accountsChanged", handleProviderStateChange)
    currentWallet.provider.on?.("disconnect", handleProviderStateChange)

    void syncWalletState()

    return () => {
      isCancelled = true
      currentWallet.provider.removeListener?.("chainChanged", handleProviderStateChange)
      currentWallet.provider.removeListener?.("accountsChanged", handleProviderStateChange)
      currentWallet.provider.removeListener?.("disconnect", handleProviderStateChange)
    }
  }, [currentWallet?.provider])

  // ─── Derived state ───
  const isConnected = walletStatus === "connected"

  const currentAddress = currentAccount?.address ?? zeroAddress

  const isWalletContextLoaded = walletStatus !== "loading"

  const canInteract = currentAddress !== zeroAddress && isConnected

  const walletActionLabel = useMemo(() => "Connect Wallet", [])

  const walletClient = useMemo(() => {
    if (!currentWallet || !currentAccount?.address || !isConnected) return undefined
    return createWalletClient({
      chain,
      transport: custom(currentWallet.provider),
      account: currentAccount.address,
    }) as WalletClient
  }, [currentWallet, currentAccount, isConnected])

  // ─── Actions ───
  const connect = async () => {
    await adapter?.connect()
  }

  const disconnect = async () => {
    if (!currentWallet) return
    await adapter?.disconnect()
  }

  const requestWalletAction = async () => {
    if (!isConnected) {
      await connect()
    }
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
        walletActionLabel,
        walletClient,
        connect,
        disconnect,
        requestWalletAction,
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
