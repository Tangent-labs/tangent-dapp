"use client"

import { ListState } from "@/types"
import { getUserBoosts } from "../../api"
import { Boost } from "../../tg_usd_type"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

type UsgBoostsContextProps = {
  children: ReactNode
}

type UsgBoostsContextValues = {
  userBoosts: Array<Boost>
  sortBoosts: (arg: ListState) => void
}

export const UsgBoostsContext = createContext<UsgBoostsContextValues | undefined>(undefined)

export const UsgBoostsProvider = ({ children }: UsgBoostsContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const [userBoosts, setUserBoosts] = useState<Array<Boost>>([])

  useEffect(() => {
    if (currentAddress) {
      getUserBoosts(currentAddress).then(() => {
        setUserBoosts([
          { type: "Dewhales boost", description: "Be a Dewhales member", boost: 1.7, status: true },
          { type: "Other boost", description: "Buy $DOGA", boost: 1000, status: false },
        ])
        // setUserBoosts(b)
      })
    }
  }, [currentAddress])

  const sortBoosts = (listState: ListState) => {
    const { key, direction } = listState.sort!

    userBoosts.sort((elementA: Boost, elementB: Boost) => {
      const aValue = elementA[key as keyof Boost]
      const bValue = elementB[key as keyof Boost]

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const contextValue: UsgBoostsContextValues = {
    userBoosts,
    sortBoosts,
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
