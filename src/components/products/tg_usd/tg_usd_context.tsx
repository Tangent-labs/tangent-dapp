"use client"

import { Address } from "viem"
import { getUserPoints } from "./api"
import { UserPoints, ZapToken } from "./tg_usd_type"
import { getBalances } from "./record/tg_usd_record_controller"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

type TgUsdContextProps = {
  children: ReactNode
  tokens: ZapToken[]
}

type TgUsdContextValues = {
  tokens: ZapToken[]
  balances: Record<Address, bigint> | null
  userPoints: UserPoints
  refetchPoints: () => Promise<void>
}

export const TgUsdContext = createContext<TgUsdContextValues | undefined>(undefined)

export const TgUsdProvider = ({ children, tokens }: TgUsdContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

  const [userPoints, setUserPoints] = useState<UserPoints>({ basePoints: 0, referralPoints: 0, totalPoints: 0, dailyRate: 0 })

  const refetchPoints = async () => {
    getUserPoints(currentAddress!).then((p) => {
      setUserPoints(p)
    })
  }

  useEffect(() => {
    if (currentAddress) {
      refetchPoints()
    }
  }, [currentAddress])

  useEffect(() => {
    const tokenAddresses: Address[] = tokens.map((el) => el.address)

    if (currentAddress && tokenAddresses.length > 0) {
      getBalances(currentAddress, tokenAddresses).then((data) => {
        if (data) {
          const tokenBalances = tokenAddresses.reduce(
            (acc, address, index) => {
              acc[address] = data[index] || BigInt(0)
              return acc
            },
            {} as Record<Address, bigint>
          )
          setBalances(tokenBalances)
        }
      })
    }
  }, [currentAddress, tokens])

  const contextValue: TgUsdContextValues = {
    tokens,
    balances,
    userPoints,
    refetchPoints,
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
