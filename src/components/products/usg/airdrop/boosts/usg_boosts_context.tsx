"use client"

import { ListState } from "@/types"
import { Boost } from "../../usg_type"
import { useUSGContext } from "../../usg_context"
import { createContext, ReactNode, useContext, useEffect } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

type UsgBoostsContextProps = {
  children: ReactNode
}

type UsgBoostsContextValues = {
  userBoosts: Array<Boost>
  getSortedRows: (rows: Boost[], listState: ListState) => Boost[]
}

export const UsgBoostsContext = createContext<UsgBoostsContextValues | undefined>(undefined)

export const UsgBoostsProvider = ({ children }: UsgBoostsContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const { refetchPoints, userBoosts } = useUSGContext()

  useEffect(() => {
    if (currentAddress) {
      refetchPoints()
    }
  }, [currentAddress])

  const getSortedRows = (rows: Boost[], listState: ListState) => {
    const { key, direction } = listState.sort!

    return [...rows].sort((elementA, elementB) => {
      const aValue = elementA[key as keyof Boost]
      const bValue = elementB[key as keyof Boost]

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const contextValue: UsgBoostsContextValues = {
    userBoosts: [...userBoosts].sort((a, b) => (a.status === b.status ? 0 : b.status ? 1 : -1)),
    getSortedRows,
  }

  return <UsgBoostsContext.Provider value={contextValue}>{children}</UsgBoostsContext.Provider>
}

export const useUsgBoostsContext = () => {
  const context = useContext(UsgBoostsContext)
  if (!context) {
    throw new Error("useUsgBoostsContext must be used within a UsgBoostsProvider")
  }
  return context
}
