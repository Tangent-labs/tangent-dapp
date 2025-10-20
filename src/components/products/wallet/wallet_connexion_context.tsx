"use client"

import { dappConfig } from "@/dapp_config"
import { chain } from "@/services/service_rpc"
import { WalletState } from "@web3-onboard/core"
import web3Onboard from "@/services/config_wallet_provider"
import { getUserBalances } from "./wallet_connexion_controller"
import { Address, createWalletClient, custom, toHex, WalletClient } from "viem"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"

export type Account = {
  address: Address
  ens: string | null
}

export type WalletConnexionContextValues = {
  isConnected: boolean
  isChainConnected: boolean
  isWellConnected: boolean
  currentAccount?: Account
  currentWallet?: WalletState
  currentAddress?: Address
  isConnecting: boolean
  connect: () => void
  disconnect: () => void
  changeNetwork: () => void
  getWalletClient: () => WalletClient | undefined
  canInteract: boolean
  userBalances: Array<{ balance: bigint; token: string; address: Address }>
  tokenInfo: (t: string) => { balance: bigint; token: string; address: Address } | undefined
  isWalletInitialized: boolean
}

interface WalletConnexionProviderProps {
  children: ReactNode
}

const WalletConnexionContext = createContext<WalletConnexionContextValues | undefined>(undefined)

export const WalletConnexionProvider = ({ children }: WalletConnexionProviderProps) => {
  const [currentWallet, setCurrentWallet] = useState<WalletState | undefined>(undefined)

  const [currentAccount, setCurrentAccount] = useState<Account | undefined>(undefined)

  const [isConnecting, setIsConnecting] = useState<boolean>(false)

  const [userBalances, setUserBalances] = useState<Array<{ balance: bigint; token: string; address: Address }>>([])

  const [isWalletInitialized, setIsWalletInitialized] = useState<boolean>(false)

  const connect = async () => {
    await web3Onboard.connectWallet()
    setIsConnecting(false)
    const state = web3Onboard.state.get()
    if (state?.wallets.length > 0) {
      setCurrentWallet(state.wallets?.at(0))
      setCurrentAccount(state.wallets?.at(0)?.accounts?.at(0) as unknown as Account)
    }
  }

  const changeNetwork = () => {
    web3Onboard.setChain({ chainId: dappConfig.chain.id })
  }

  const getWalletClient = (): WalletClient | undefined => {
    if (!currentWallet) return

    const client = createWalletClient({
      chain,
      transport: custom(currentWallet.provider),
      account: currentAddress,
    })

    return client as WalletClient
  }

  const disconnect = async () => {
    if (!currentWallet) return
    await web3Onboard.disconnectWallet({ label: currentWallet?.label })
  }

  // is there an actual wallet connect on the DAPP
  const isConnected = useMemo<boolean>(() => {
    return !!currentAccount?.address || false
  }, [currentWallet])

  // is the connected wallet  has the good chain selected
  const isChainConnected = useMemo<boolean>(() => {
    return currentWallet?.chains?.at(0)?.id === toHex(dappConfig.chain.id)
  }, [currentWallet])

  const currentAddress = useMemo<Address | undefined>(() => {
    return currentAccount?.address
  }, [currentAccount])

  // are all the condition for interacting with the daap are met .
  const isWellConnected = useMemo<boolean>(() => {
    return isConnected && isChainConnected
  }, [currentWallet])

  useEffect(() => {
    const state = web3Onboard.state.select("wallets")

    const handleUpdate = (wallets: WalletState[]) => {
      if (wallets.length === 0) {
        setCurrentWallet(undefined)
        setCurrentAccount(undefined)
        return
      }

      const newWallet = wallets[0]
      const newAccount = wallets[0].accounts[0] as unknown as Account

      if (newWallet.label !== currentWallet?.label) {
        setCurrentWallet(newWallet)
      }

      setCurrentAccount(newAccount)
      setIsWalletInitialized(true)
    }

    /**
     * Hack when the user is not connected
     */
    setTimeout(() => {
      const state = web3Onboard.state.get().wallets

      if (state.length === 0) {
        setIsWalletInitialized(true)
      }
    }, 800)

    /**
     * Subscribe to wallet state update
     */
    const subscription = state.subscribe({
      next: (update: WalletState[]) => {
        handleUpdate(update)
      },
      error: (err: Error) => {
        console.error("Error in subscription:", err)
      },
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [currentWallet, currentAccount])

  const canInteract = useMemo(() => {
    return !!currentAddress && isWellConnected
  }, [currentAddress, isWellConnected])

  useEffect(() => {
    if (currentAddress) {
      getUserBalances(currentAddress).then((res) => {
        setUserBalances(res)
      })
    }
  }, [currentAddress])

  const tokenInfo = useCallback(
    (t: string) => {
      return userBalances.find((el) => el.token === t)
    },
    [userBalances]
  )

  const contextValue: WalletConnexionContextValues = {
    currentAddress,
    currentAccount,
    currentWallet,
    isConnected,
    isChainConnected,
    isWellConnected,
    isConnecting,
    getWalletClient,
    connect,
    disconnect,
    changeNetwork,
    canInteract,
    userBalances,
    tokenInfo,
    isWalletInitialized,
  }

  return <WalletConnexionContext.Provider value={contextValue}>{children} </WalletConnexionContext.Provider>
}

export const useWalletConnexionContext = () => {
  const context = useContext(WalletConnexionContext)
  if (!context) {
    throw new Error("useWalletConnexionContext must be used within a WalletConnexionProvider")
  }
  return context
}
