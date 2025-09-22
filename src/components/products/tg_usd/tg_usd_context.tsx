"use client"

import { Address } from "viem"
import { TANStakingInfo } from "../vs_tan/rstan_types"
import { getUSGsUSGMetrics } from "./tg_usd_controller"
import { getCurrentBlock } from "@/services/service_rpc"
import { getLpUserPoints, getVoteUserPoints } from "./api"
import { getBalances } from "./record/tg_usd_record_controller"
import { getTanStakeOnChainData } from "../vs_tan/stake/stake_tan_controller"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"
import { USGStakingInfo, LpUserPoints, ZapToken, VoteUserPoints } from "./tg_usd_type"
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"

type USGContextProps = {
  children: ReactNode
  tokens: ZapToken[]
}

type USGContextValues = {
  tokens: ZapToken[]
  balances: Record<Address, bigint> | null
  lpUserPoints: LpUserPoints
  voteUserPoints: VoteUserPoints
  refetchPoints: () => Promise<void>
  loadUSGsUSGMetrics: () => void
  USGsUSGMetrics: USGStakingInfo | undefined
  TANsTANMetrics: TANStakingInfo | undefined
  loadTanSTANMetrics: () => void
}

export const USGContext = createContext<USGContextValues | undefined>(undefined)

export const USGProvider = ({ children, tokens }: USGContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

  const [lpUserPoints, setLpUserPoints] = useState<LpUserPoints>({ lpDailyRate: 0, lpTotalPoints: 0 })

  const [voteUserPoints, setVoteUserPoints] = useState<VoteUserPoints>({ voteTotalPoints: 0 })

  const [USGsUSGMetrics, setUSGsUSGMetrics] = useState<USGStakingInfo | undefined>()

  const [TANsTANMetrics, setTANsTANMetrics] = useState<TANStakingInfo | undefined>()

  const loadUSGsUSGMetrics = useCallback(() => {
    if (currentAddress) {
      getUSGsUSGMetrics(currentAddress).then((data) => {
        setUSGsUSGMetrics(data)
      })
    }
  }, [currentAddress])

  const loadTanSTANMetrics = useCallback(() => {
    if (currentAddress) {
      getTanStakeOnChainData(currentAddress).then((data) => {
        setTANsTANMetrics(data)
      })
    }
  }, [currentAddress])

  const refetchPoints = async () => {
    const currentBlock = await getCurrentBlock()

    const isoEndDate = new Date(Number(currentBlock.timestamp) * 1000).toISOString()
    const dateFrom = encodeURIComponent(isoEndDate)

    getLpUserPoints(currentAddress!, dateFrom).then((lpPts) => {
      setLpUserPoints(lpPts)
    })

    getVoteUserPoints(currentAddress!).then((votePts) => {
      setVoteUserPoints(votePts)
    })
  }

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
    loadTanSTANMetrics,
    USGsUSGMetrics,
    TANsTANMetrics,
    voteUserPoints,
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
