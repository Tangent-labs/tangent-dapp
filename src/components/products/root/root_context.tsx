"use client"

import { useContext, useEffect, useState, createContext, ReactNode } from "react"
import { CustomCurveRoutes } from "../tg_usd/global_quote_controller"

import * as swapRoutes from "../tg_usd/swapRoutes.json"

export type RootContextValues = {
  curveRoutes: CustomCurveRoutes
}

const RootContext = createContext<RootContextValues | undefined>(undefined)

const CUSTOM_CURVE_ROUTES_KEY = "CURVE_CUSTOM_ROUTING"
const CUSTOM_CURVE_ROUTES_REFRESH_MIN = 30
const CUSTOM_CURVE_ROUTES_GITHUB_URL = "https://raw.githubusercontent.com/Tangent-labs/public-files/refs/heads/main/routes.json"

interface RootProviderProps {
  children: ReactNode
}

export const RootProvider = ({ children }: RootProviderProps) => {
  const [curveRoutes, setCurveRoutes] = useState<CustomCurveRoutes>({ errors: [], success: {} })

  const fetchAndStore = async (localStorageKey: string) => {
    try {
      let data
      if (process.env.ENV_NAME === "local") {
        data = swapRoutes
      } else {
        const response = await fetch(CUSTOM_CURVE_ROUTES_GITHUB_URL)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        data = await response.json()
      }

      setCurveRoutes(data)

      const payload = {
        data,
        date: new Date().toISOString(),
      }

      localStorage.setItem(localStorageKey, JSON.stringify(payload))
    } catch (err) {
      console.error("Erreur lors du fetch du fichier GitHub", err)
    }
  }

  useEffect(() => {
    // Read the storage
    const raw = localStorage.getItem(CUSTOM_CURVE_ROUTES_KEY)
    let shouldFetch = true
    let storedDate: Date | null = null

    if (raw) {
      const parsed = JSON.parse(raw)

      if (parsed && typeof parsed.date === "string") {
        storedDate = new Date(parsed.date)
        const now = new Date()
        const diffMs = now.getTime() - storedDate.getTime()
        const diffMin = diffMs / (1000 * 60)

        if (diffMin < CUSTOM_CURVE_ROUTES_REFRESH_MIN) {
          shouldFetch = false
        }
      }

      if (!shouldFetch) {
        setCurveRoutes(parsed.data)
        return
      }
    }

    fetchAndStore(CUSTOM_CURVE_ROUTES_KEY)
  }, [])

  const contextValue: RootContextValues = { curveRoutes }

  return <RootContext.Provider value={contextValue}>{children}</RootContext.Provider>
}

export const useRootContext = () => {
  const context = useContext(RootContext)
  if (!context) {
    throw new Error("useWalletConnexionContext must be used within a WalletConnexionProvider")
  }
  return context
}
