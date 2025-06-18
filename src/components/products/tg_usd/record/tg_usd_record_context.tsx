"use client"

import { AssetApr, AssetDataPriced, CollateralInfo, ListState, TgUsdMarketAsset } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"

import { Address } from "viem"
import { useTgUsdContext } from "../tg_usd_context"
import { getUserPositions } from "../api"

import {
  BalanceAllowanceData,
  ChainViewMarketRow,
  MarketDetailData,
  TgUsdMarket,
  TgUsdMarketAmounts,
  TgUsdMarketDisplayData,
  TgUsdMarketLoanDisplayData,
  UserPosition,
} from "../tg_usd_type"
import {
  getBalances,
  getComputedFutureLoanData,
  getMarketApr,
  getMarketDisplayData,
  getTgUsdMarketRecordData,
  getBalancesAndAllowances,
  transformMarketData,
} from "./tg_usd_record_controller"
import { sortUserData } from "./position_history/tg_usd_position_history_controller"

type TgUsdRecordContextProps = {
  children: ReactNode
  collateral: TgUsdMarketAsset
  collateralInfo: CollateralInfo
  marketInfo: TgUsdMarket
  tgUSDInfo: AssetDataPriced
}

type TgUsdRecordContextValues = {
  collateral: TgUsdMarketAsset
  collateralInfo: CollateralInfo
  isLoading: boolean
  marketData?: MarketDetailData
  loadOnChainData: () => void
  fetchBalanceAllowanceData: (address: Address) => void
  tgUSDInfo: AssetDataPriced
  futureMarketDisplayData: TgUsdMarketLoanDisplayData
  marketDisplayData: TgUsdMarketDisplayData
  apr?: AssetApr
  currentAmounts: TgUsdMarketAmounts
  setCurrentAmounts: (amounts: TgUsdMarketAmounts) => void

  marketInfo: TgUsdMarket

  balances: Record<Address, bigint> | null

  balanceAllowanceData: BalanceAllowanceData | null
  setBalanceAllowanceData: (arg: BalanceAllowanceData) => void

  displayRows: UserPosition[]

  isUserHistoryLoading: boolean
  setIsUserHistoryLoading: (v: boolean) => void

  customSort: (arg: ListState) => void
}

export const TgUsdRecordContext = createContext<TgUsdRecordContextValues | undefined>(undefined)

export const TgUsdRecordProvider = ({ collateral, marketInfo, collateralInfo, children, tgUSDInfo }: TgUsdRecordContextProps) => {
  const { tokens } = useTgUsdContext()

  const { currentAddress, getWalletClient } = useWalletConnexionContext()

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

  const [onChainData, setOnChainData] = useState<ChainViewMarketRow | undefined>()

  const [userPositions, setUserPositions] = useState<UserPosition[] | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isUserHistoryLoading, setIsUserHistoryLoading] = useState<boolean>(true)

  const [apr, setApr] = useState<AssetApr | undefined>()

  const [balanceAllowanceData, setBalanceAllowanceData] = useState<BalanceAllowanceData | null>(null)

  const [currentAmounts, setCurrentAmounts] = useState<TgUsdMarketAmounts>({
    depositWeiValue: 0n,
    borrowWeiValue: 0n,
    withdrawWeiValue: 0n,
    repayWeiValue: 0n,
    zapValue: 0n,
    liquidateValue: 0n,
  })

  const fetchUserPositions = () => {
    getUserPositions(currentAddress!, marketInfo.marketAddress).then((pos) => {
      if (pos) {
        setUserPositions(pos)
      } else {
        setUserPositions([])
      }
    })
  }

  useEffect(() => {
    if (currentAddress) {
      loadOnChainData()
      fetchUserPositions()
    }
  }, [currentAddress])

  useEffect(() => {
    loadApr()
  }, [])

  const loadOnChainData = () => {
    setIsLoading(true)
    getTgUsdMarketRecordData(currentAddress, marketInfo.marketAddress).then((data) => {
      setOnChainData(data)
      setIsLoading(false)
    })
  }

  const loadApr = () => {
    if (marketData?.marketAddress) setApr(getMarketApr(marketInfo.marketAddress))
  }
  const marketData = useMemo(() => {
    if (!onChainData) return
    return transformMarketData(onChainData, collateralInfo)
  }, [onChainData])

  const futureMarketDisplayData = useMemo(() => {
    return getComputedFutureLoanData(marketData, collateralInfo, currentAmounts)
  }, [currentAmounts, marketData])

  const marketDisplayData = useMemo(() => {
    return getMarketDisplayData(marketData, collateralInfo)
  }, [marketData])

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

  const fetchBalanceAllowanceData = async (depositAssetInfo: Address) => {
    if (!depositAssetInfo) return

    try {
      const walletClient = getWalletClient()

      const data = await getBalancesAndAllowances(walletClient!, depositAssetInfo, marketInfo?.marketAddress)

      setBalanceAllowanceData(data ? (data[0] as BalanceAllowanceData) : null)
    } catch (error) {
      console.error("Failed to fetch balance/allowance:", error)
    }
  }

  //
  // USER POSITION CONTEXT

  const displayRows = useMemo(() => {
    if (!userPositions) {
      setIsUserHistoryLoading(true)
      return []
    }
    if (!!userPositions && userPositions.length === 0) {
      setIsUserHistoryLoading(false)
      return []
    }

    const rows = sortUserData(userPositions)
    setIsUserHistoryLoading(false)

    return rows
  }, [userPositions])

  const customSort = (listState: ListState) => {
    const { key, direction } = listState.sort!

    displayRows.sort((elementA: UserPosition, elementB: UserPosition) => {
      if (key === "usgAmount") {
        const aValue = elementA[key as keyof UserPosition]
        const bValue = elementB[key as keyof UserPosition]

        if (Number(aValue) < Number(bValue)) return direction === "asc" ? -1 : 1
        if (Number(aValue) > Number(bValue)) return direction === "asc" ? 1 : -1

        return 0
      } else {
        const aValue = elementA[key as keyof UserPosition]
        const bValue = elementB[key as keyof UserPosition]

        if (aValue < bValue) return direction === "asc" ? -1 : 1
        if (aValue > bValue) return direction === "asc" ? 1 : -1

        return 0
      }
    })
  }

  const contextValue: TgUsdRecordContextValues = {
    isLoading,
    collateral,
    collateralInfo,
    marketData,
    loadOnChainData,
    tgUSDInfo,
    marketDisplayData,
    futureMarketDisplayData,
    currentAmounts,
    setCurrentAmounts,
    apr,
    balances,
    balanceAllowanceData,
    setBalanceAllowanceData,
    fetchBalanceAllowanceData,
    marketInfo,
    //
    displayRows,
    customSort,
    isUserHistoryLoading,
    setIsUserHistoryLoading,
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
