"use client"

import { Address, zeroAddress } from "viem"
import { getUSGsUSGMetrics } from "./usg_controller"
import { getBalances } from "./record/usg_record_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { getMarketsAprs, getPointsDetails } from "./client_api"
import { ChainViewMarketList, USGGlobalData, USGStakingInfo, VoteUserPoints, RefereesPoints, MarketAPRs, LpUserPoints, Boost } from "./usg_type"
import { getUSGMarketsData, transformGlobalData } from "./list/usg_market_controller"
import { useRootContext } from "../root/root_context"
import { ERC20S } from "@/data/erc20s"
import { mapUserBoosts } from "./airdrop/boosts/usg_boosts_controller"

// import { getTanStakeOnChainData } from "../vs_tan/stake/stake_tan_controller"
// import { TANStakingInfo } from "../vs_tan/rstan_types"

type USGContextProps = {
  children: ReactNode
}

type USGContextValues = {
  balances: Record<Address, bigint> | null
  lpUserPoints: LpUserPoints
  voteUserPoints: VoteUserPoints
  userBoostFactor: number
  refetchPoints: () => Promise<void>
  loadUSGsUSGMetrics: () => void
  USGsUSGMetrics: USGStakingInfo | undefined
  // TANsTANMetrics: TANStakingInfo | undefined
  // loadTanSTANMetrics: () => void
  refereesPoints: RefereesPoints
  marketAprs: MarketAPRs[]
  userBoosts: Boost[]
  onChainData: ChainViewMarketList | undefined
  globalData: USGGlobalData
}

export const USGContext = createContext<USGContextValues | undefined>(undefined)

export const USGProvider = ({ children }: USGContextProps) => {
  const { getCachedCurrentBlock } = useRootContext()

  const { currentAddress, isWalletContextLoaded } = useWalletConnexionContext()

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

  const [lpUserPoints, setLpUserPoints] = useState<LpUserPoints>({ lpDailyRate: 0, lpTotalPoints: 0 })

  const [voteUserPoints, setVoteUserPoints] = useState<VoteUserPoints>({ voteTotalPoints: 0 })

  const [refereesPoints, setRefereesPoints] = useState<RefereesPoints>({ lpPoints: 0, votePoints: 0 })

  const [userBoostFactor, setUserBoostFactor] = useState<number>(1)

  const [USGsUSGMetrics, setUSGsUSGMetrics] = useState<USGStakingInfo | undefined>()

  // const [TANsTANMetrics, setTANsTANMetrics] = useState<TANStakingInfo | undefined>()

  const [onChainData, setOnChainData] = useState<ChainViewMarketList | undefined>()

  const [marketAprs, setMarketAprs] = useState<Array<MarketAPRs>>([])

  const [userBoosts, setUserBoosts] = useState<Array<Boost>>([])

  useEffect(() => {
    getMarketsAprs().then((data) => {
      setMarketAprs(data)
    })
  }, [])

  const loadUSGsUSGMetrics = () => {
    getUSGsUSGMetrics(currentAddress || zeroAddress).then((data) => {
      setUSGsUSGMetrics(data)
    })
  }

  const loadOnChainData = () => {
    getUSGMarketsData(currentAddress || zeroAddress).then((data) => {
      setOnChainData(data)
    })
  }

  // const loadTanSTANMetrics = () => {
  //   getTanStakeOnChainData(currentAddress || zeroAddress).then((data) => {
  //     setTANsTANMetrics(data)
  //   })
  // }

  /**
   * On init
   */
  useEffect(() => {
    if (isWalletContextLoaded) {
      loadUSGsUSGMetrics()
      loadOnChainData()
      refetchPoints()
      // loadTanSTANMetrics()
    }
  }, [isWalletContextLoaded, currentAddress])

  const globalData = useMemo(() => transformGlobalData(onChainData), [onChainData])

  const refetchPoints = async () => {
    const currentBlock = await getCachedCurrentBlock()

    getPointsDetails(currentAddress, Number(currentBlock.timestamp)).then((data) => {
      setLpUserPoints({ lpDailyRate: Number(data.lp.dailyRate), lpTotalPoints: Number(data.lp.total) })
      setVoteUserPoints({ voteTotalPoints: Number(data.vote.total) })
      setRefereesPoints({ lpPoints: Number(data.lp.referees), votePoints: Number(data.vote.referees) })
      setUserBoostFactor(data.boost.multiplicator)
      setUserBoosts(mapUserBoosts(data.boost.keys))
    })
  }

  useEffect(() => {
    const tokenAddresses: Address[] = ERC20S.map((el) => el.address as Address)

    if (currentAddress !== zeroAddress) {
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
  }, [currentAddress])

  const contextValue: USGContextValues = {
    balances,
    lpUserPoints,
    refetchPoints,
    loadUSGsUSGMetrics,
    USGsUSGMetrics,
    voteUserPoints,
    refereesPoints,
    marketAprs,
    userBoostFactor,
    userBoosts,
    onChainData,
    globalData,
    // loadTanSTANMetrics,
    // TANsTANMetrics,
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
