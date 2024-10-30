"use client"
import { dappConfig } from "@/dapp_config"
import { formatAddress } from "@/lib/utils"
import web3Onboard from "@/services/config_wallet_provider"
import { WalletState } from "@web3-onboard/core"
import { NotificationType } from "@web3-onboard/core/dist/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { Address, toHex } from "viem"

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
  isConnecting: boolean
  connect: () => void
  disconnect: () => void
  changeNetwork: () => void
}

interface WalletConnexionProviderProps {
  children: ReactNode
}

// Create the context
const WalletConnexionContext = createContext<WalletConnexionContextValues | undefined>(undefined)

// Create a provider component
export const WalletConnexionProvider = ({ children }: WalletConnexionProviderProps) => {
  const [currentWallet, setCurrentWallet] = useState<WalletState | undefined>(undefined)
  const [currentAccount, setCurrentAccount] = useState<Account | undefined>(undefined)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)

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

  // are all the condition for interacting with the daap are met .
  const isWellConnected = useMemo<boolean>(() => {
    return isConnected && isChainConnected
  }, [currentWallet])

  const notify = (message: string, type: NotificationType = "hint") => {
    web3Onboard.state.actions.customNotification({
      type: type,
      message: message,
      autoDismiss: 3 * 1000,
    })
  }

  // manage  the event handling
  useEffect(() => {
    const state = web3Onboard.state.select("wallets")
    const currentAddress = currentAccount?.address
    const debounce = (func: (arg: WalletState[]) => void, delay: number) => {
      let timeoutId: ReturnType<typeof setTimeout>
      return (arg: WalletState[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(arg), delay)
      }
    }

    const handleUpdate = debounce((wallets: WalletState[]) => {
      if (wallets?.at(0)?.label !== currentWallet?.label) {
        setCurrentWallet(wallets?.at(0))
      }
      // check if account have changed
      if (wallets?.at(0)?.accounts?.at(0)?.address !== currentAddress) {
        if (wallets?.at(0)?.accounts?.at(0)?.address) notify(`Connected with  ${formatAddress(wallets?.at(0)?.accounts?.at(0)?.address)}`)
        else notify(`Disconnected`)
      }

      setCurrentAccount(wallets?.at(0)?.accounts?.at(0) as Account | undefined)
    }, 500)

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

  const contextValue: WalletConnexionContextValues = {
    currentAccount,
    currentWallet,
    isConnected,
    isChainConnected,
    isWellConnected,
    isConnecting,

    connect,
    disconnect,
    changeNetwork,
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
