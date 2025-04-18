"use client"

import { createContext, ReactNode, useContext } from "react"
import { ZapToken } from "./tg_usd_type"

type TgUsdContextProps = {
  children: ReactNode
  tokens: ZapToken[]
}

type TgUsdContextValues = {
  tokens: ZapToken[]
}

export const TgUsdContext = createContext<TgUsdContextValues | undefined>(undefined)

export const TgUsdProvider = ({ children, tokens }: TgUsdContextProps) => {
  const contextValue: TgUsdContextValues = {
    tokens,
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
