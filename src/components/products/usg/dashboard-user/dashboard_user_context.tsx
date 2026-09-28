"use client"

import { zeroAddress } from "viem"
import { EMPTY_USER_DASHBOARD } from "./dashboard_user_adapters"
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { getUserDashboardData, IS_USER_DASHBOARD_MOCK } from "./dashboard_user_repository"
import type { UserDashboardData } from "./dashboard_user_type"

type USGDashboardUserContextProps = {
  children: ReactNode
}

type USGDashboardUserContextValues = {
  data: UserDashboardData | null
  isLoading: boolean
  error: string | null
  // No wallet connected: the dashboard is empty (except with the mock data)
  isWalletConnected: boolean
  // Loads the data again (after a transaction)
  reload: () => void
}

const USGDashboardUserContext = createContext<USGDashboardUserContextValues | undefined>(undefined)

export const USGDashboardUserProvider = ({ children }: USGDashboardUserContextProps) => {
  const { currentAddress, isWalletContextLoaded } = useWalletConnexionContext()

  const isWalletConnected = IS_USER_DASHBOARD_MOCK || currentAddress !== zeroAddress

  const [data, setData] = useState<UserDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  // Once loaded, a new load (wallet switched, after a claim) keeps the page and only updates the numbers,
  // instead of showing the skeleton and rolling every number again
  const hasData = useRef(false)

  useEffect(() => {
    // Wait for the wallet to be known, and do not load anything for a visitor without wallet
    if (!isWalletContextLoaded) return

    if (!isWalletConnected) {
      setData(EMPTY_USER_DASHBOARD)
      setError(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    if (!hasData.current) setIsLoading(true)
    setError(null)

    getUserDashboardData(currentAddress)
      .then((result) => {
        if (cancelled) return
        hasData.current = true
        setData(result)
      })
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : "Unable to load the dashboard"))
      .finally(() => !cancelled && setIsLoading(false))

    // Ignore the response of an outdated request (wallet switched while loading)
    return () => {
      cancelled = true
    }
  }, [currentAddress, isWalletContextLoaded, isWalletConnected, reloadKey])

  return (
    <USGDashboardUserContext.Provider value={{ data, isLoading, error, isWalletConnected, reload: () => setReloadKey((key) => key + 1) }}>
      {children}
    </USGDashboardUserContext.Provider>
  )
}

export const useUSGDashboardUserContext = () => {
  const context = useContext(USGDashboardUserContext)
  if (!context) throw new Error("useUSGDashboardUserContext must be used within a USGDashboardUserProvider")
  return context
}
