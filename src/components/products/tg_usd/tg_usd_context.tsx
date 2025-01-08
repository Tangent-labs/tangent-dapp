"use client"

import { createContext, ReactNode, useContext } from "react"

type TgUsdContextProps = {
  children: ReactNode
}

type TgUsdContextValues = { test: boolean }

export const TgUsdContext = createContext<TgUsdContextValues | undefined>(undefined)

export const TgUsdProvider = ({ children }: TgUsdContextProps) => {
  const contextValue: TgUsdContextValues = {
    test: true,
  }

  return <TgUsdContext.Provider value={contextValue}>{children}</TgUsdContext.Provider>
}

export const useTgUsdContext = () => {
  const context = useContext(TgUsdContext)
  if (!context) {
    throw new Error("useTgUsdContext must be used within a TgUsdProvider")
  }
  return context
}
