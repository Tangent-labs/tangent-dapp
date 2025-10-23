"use client"

import { Address, zeroAddress } from "viem"
import { TANStakingInfo } from "../vs_tan/rstan_types"
import { getUSGsUSGMetrics } from "./tg_usd_controller"
import { getCurrentBlock } from "@/services/service_rpc"
import { getBalances } from "./record/tg_usd_record_controller"
import { getTanStakeOnChainData } from "../vs_tan/stake/stake_tan_controller"
import { useWalletConnexionContext } from "../wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { getLpUserPoints, getMarketAprs, getUserRefereesPoints, getVoteUserPoints } from "./client_api"
import { USGStakingInfo, LpUserPoints, ZapToken, VoteUserPoints, RefereesPoints, MarketAPR } from "./tg_usd_type"

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
  refereesPoints: RefereesPoints
  marketAprs: MarketAPR[]
}

export const USGContext = createContext<USGContextValues | undefined>(undefined)

export const USGProvider = ({ children, tokens }: USGContextProps) => {
  const { currentAddress, isWalletInitialized } = useWalletConnexionContext()

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

  const [lpUserPoints, setLpUserPoints] = useState<LpUserPoints>({ lpDailyRate: 0, lpTotalPoints: 0 })

  const [voteUserPoints, setVoteUserPoints] = useState<VoteUserPoints>({ voteTotalPoints: 0 })

  const [refereesPoints, setRefereesPoints] = useState<RefereesPoints>({ lpPoints: 0, votePoints: 0 })

  const [USGsUSGMetrics, setUSGsUSGMetrics] = useState<USGStakingInfo | undefined>()

  const [TANsTANMetrics, setTANsTANMetrics] = useState<TANStakingInfo | undefined>()

  const [marketAprs, setMarketAprs] = useState<Array<MarketAPR>>([])

  const fetchAprs = async () => {
    const markets = await getMarketAprs()

    setMarketAprs(markets)
  }

  useEffect(() => {
    fetchAprs()
  }, [])

  const loadUSGsUSGMetrics = () => {
    getUSGsUSGMetrics(currentAddress || zeroAddress).then((data) => {
      setUSGsUSGMetrics(data)
    })
  }

  const loadTanSTANMetrics = () => {
    getTanStakeOnChainData(currentAddress || zeroAddress).then((data) => {
      setTANsTANMetrics(data)
    })
  }

  /**
   * On init
   */
  useEffect(() => {
    if (isWalletInitialized) {
      loadUSGsUSGMetrics()
      loadTanSTANMetrics()
    }
  }, [isWalletInitialized])

  /**
   * On user logs in/logs out
   */
  useEffect(() => {
    if (isWalletInitialized && USGsUSGMetrics) {
      loadUSGsUSGMetrics()
      loadTanSTANMetrics()
    }
  }, [currentAddress])

  const getRefereesPoints = async () => {
    getUserRefereesPoints(currentAddress!).then((p) => {
      setRefereesPoints(p)
    })
  }

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

    getRefereesPoints()
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
    refereesPoints,
    marketAprs,
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
