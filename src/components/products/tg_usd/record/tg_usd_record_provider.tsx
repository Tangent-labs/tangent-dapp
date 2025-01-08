"use client"

import { createContext, ReactNode, useContext, useState } from "react"

type TgUsdRecordContextProps = {
  children: ReactNode
}

type TgUsdRecordContextValues = {
  isLoading: boolean
}

export const TgUsdRecordContext = createContext<TgUsdRecordContextValues | undefined>(undefined)

export const TgUsdRecordProvider = ({ children }: TgUsdRecordContextProps) => {
  const [isLoading] = useState<boolean>(false)
  const contextValue: TgUsdRecordContextValues = {
    isLoading,
  }

  return <TgUsdRecordContext.Provider value={contextValue}>{children}</TgUsdRecordContext.Provider>
}

export const useTgUsdRecordContext = () => {
  const context = useContext(TgUsdRecordContext)
  if (!context) {
    throw new Error("useTgUsdRecordContext must be used within a TgUsdRecordProvider")
  }
  return context
}
