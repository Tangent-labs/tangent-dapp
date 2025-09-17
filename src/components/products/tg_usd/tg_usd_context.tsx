"use client"

import { Address } from "viem"
import { getLpUserPoints } from "./api"
import { StakingInfo, LpUserPoints, ZapToken } from "./tg_usd_type"
import { getBalances } from "./record/tg_usd_record_controller"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { getCurrentBlock } from "@/services/service_rpc"
import { getUSGsUSGMetrics } from "./tg_usd_controller"

type USGContextProps = {
  children: ReactNode
  tokens: ZapToken[]
}

type USGContextValues = {
  tokens: ZapToken[]
  balances: Record<Address, bigint> | null
  lpUserPoints: LpUserPoints
  refetchPoints: () => Promise<void>
  loadUSGsUSGMetrics: () => void
  USGsUSGMetrics: StakingInfo | undefined
}

export const USGContext = createContext<USGContextValues | undefined>(undefined)

export const USGProvider = ({ children, tokens }: USGContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

  const [lpUserPoints, setLpUserPoints] = useState<LpUserPoints>({ lpDailyRate: 0, lpTotalPoints: 0 })

  const [USGsUSGMetrics, setUSGsUSGMetrics] = useState<StakingInfo | undefined>()

  const loadUSGsUSGMetrics = useCallback(() => {
    if (currentAddress) {
      getUSGsUSGMetrics(currentAddress).then((data) => {
        setUSGsUSGMetrics(data)
      })
    }
  }, [currentAddress])

  const refetchPoints = async () => {
    const currentBlock = await getCurrentBlock()

    const isoEndDate = new Date(Number(currentBlock.timestamp) * 1000).toISOString()
    const dateFrom = encodeURIComponent(isoEndDate)

    getLpUserPoints(currentAddress!, dateFrom).then((p) => {
      setLpUserPoints(p)
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

  const contextValue: USGContextValues = {
    tokens,
    balances,
    lpUserPoints,
    refetchPoints,
    loadUSGsUSGMetrics,
    USGsUSGMetrics,
  }

  return <USGContext.Provider value={contextValue}>{children}</USGContext.Provider>
}

export const useUSGContext = () => {
  const context = useContext(USGContext)
  if (!context) {
    throw new Error("useUSGContext must be used within a USGProvider")
  }
  return context
}
