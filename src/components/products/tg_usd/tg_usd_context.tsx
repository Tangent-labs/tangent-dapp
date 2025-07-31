"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { ZapToken } from "./tg_usd_type"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"
import { Address } from "viem"
import { getBalances } from "./record/tg_usd_record_controller"

type TgUsdContextProps = {
  children: ReactNode
  tokens: ZapToken[]
}

type TgUsdContextValues = {
  tokens: ZapToken[]
  balances: Record<Address, bigint> | null
}

export const TgUsdContext = createContext<TgUsdContextValues | undefined>(undefined)

export const TgUsdProvider = ({ children, tokens }: TgUsdContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

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
