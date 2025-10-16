"use client"

import {
  BalanceAllowanceData,
  ChainViewMarketRow,
  MarketDetailData,
  USGMarket,
  USGMarketAmounts,
  USGMarketDisplayData,
  USGMarketLoanDisplayData,
  TotalBorrow,
  UserPosition,
} from "../tg_usd_type"

import {
  getComputedFutureLoanData,
  getMarketDisplayData,
  getUSGMarketRecordData,
  getBalancesAndAllowances,
  transformMarketData,
  computeIR,
  computeVAPR,
  mapToTotalBorrow,
} from "./tg_usd_record_controller"

import { Address, formatUnits } from "viem"
import { usePathname } from "next/navigation"
import { useUSGContext } from "../tg_usd_context"
import { USG_CONTRACT } from "../tg_usd_repository"
import { getCurrentBlock } from "@/services/service_rpc"
import { getHistoricalMarketData, getUserPositions } from "../api"
import { AssetDataPriced, CollateralInfo, ListState } from "@/types"
import { useUSGMaketListContext } from "../list/tg_usd_market_list_context"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { sortUserData } from "./position_history/tg_usd_position_history_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"

type USGRecordContextProps = {
  children: ReactNode
  collateral: string
  collateralInfo: CollateralInfo
  marketInfo: USGMarket
}

type USGRecordContextValues = {
  collateral: string
  collateralInfo: CollateralInfo
  isLoading: boolean
  marketData?: MarketDetailData
  loadOnChainData: () => void
  fetchBalanceAllowanceData: (address: Address) => void
  USGInfo: AssetDataPriced
  futureMarketDisplayData: USGMarketLoanDisplayData
  marketDisplayData: USGMarketDisplayData

  currentAmounts: USGMarketAmounts
  setCurrentAmounts: (amounts: USGMarketAmounts) => void

  marketInfo: USGMarket

  balanceAllowanceData: BalanceAllowanceData | null
  setBalanceAllowanceData: (arg: BalanceAllowanceData) => void

  displayRows: UserPosition[]

  isUserHistoryLoading: boolean
  setIsUserHistoryLoading: (v: boolean) => void

  customSort: (arg: ListState) => void

  isLeveraged: boolean
  setIsLeveraged: (v: boolean) => void

  pricedCollateralInfo: CollateralInfo

  debtFarming: number
  setDebtFarming: (v: number) => void

  debtVAPR: number
  setDebtVAPR: (v: number) => void

  initialCollatAmount: number
  setInitialCollatAmount: (v: number) => void

  chartData: Array<{ price: number; vAPR: number }>
  setChartData: (v: Array<{ price: number; vAPR: number }>) => void

  feature: string

  totalBorrow: TotalBorrow
  setTotalBorrow: (v: TotalBorrow) => void

  totalBorrowTimeWindow: string
  setTotalBorrowTimeWindow: (v: string) => void

  onChainData: ChainViewMarketRow | undefined

  canLeverage: boolean

  currentTotalMarketApr: number
}

const LEVERAGE_TRESHOLD = 0.989

export const USGRecordContext = createContext<USGRecordContextValues | undefined>(undefined)

export const USGRecordProvider = ({ collateral, marketInfo, collateralInfo, children }: USGRecordContextProps) => {
  const { currentAddress, getWalletClient } = useWalletConnexionContext()

  const { marketAprs } = useUSGContext()

  const path = usePathname()

  const { globalData } = useUSGMaketListContext()

  const [chartData, setChartData] = useState<Array<{ price: number; vAPR: number }>>([])

  const [onChainData, setOnChainData] = useState<ChainViewMarketRow | undefined>()

  const [userPositions, setUserPositions] = useState<UserPosition[] | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isLeveraged, setIsLeveraged] = useState<boolean>(false)

  const [totalBorrowTimeWindow, setTotalBorrowTimeWindow] = useState<string>("1m")

  const [debtFarming, setDebtFarming] = useState<number>(0)

  const [debtVAPR, setDebtVAPR] = useState<number>(0)

  const [initialCollatAmount, setInitialCollatAmount] = useState<number>(0)

  const [isUserHistoryLoading, setIsUserHistoryLoading] = useState<boolean>(true)

  const [totalBorrow, setTotalBorrow] = useState<TotalBorrow>({ latestTotalDebt: "0", data: [] })

  const [balanceAllowanceData, setBalanceAllowanceData] = useState<BalanceAllowanceData | null>(null)

  const [currentAmounts, setCurrentAmounts] = useState<USGMarketAmounts>({
    depositWeiValue: 0n,
    borrowWeiValue: 0n,
    withdrawWeiValue: 0n,
    repayWeiValue: 0n,
    zapValue: 0n,
    liquidateValue: 0n,
  })

  const fetchUserPositions = async () => {
    if (currentAddress) {
      getUserPositions(currentAddress, marketInfo.marketAddress).then((pos) => {
        if (pos) {
          setUserPositions(pos)
        } else {
          setUserPositions([])
        }
      })
    }
  }

  useEffect(() => {
    if (currentAddress) {
      loadOnChainData()
      fetchUserPositions()
    }
  }, [currentAddress])

  const loadOnChainData = () => {
    setIsLoading(true)
    getUSGMarketRecordData(currentAddress, marketInfo.marketAddress).then((data) => {
      setOnChainData(data)
      setIsLoading(false)
    })
  }

  const USGInfo = useMemo(() => {
    if (globalData && globalData.USGPrice) {
      return { address: USG_CONTRACT.USG, decimals: 18, displayDecimals: 2, symbol: "USG", price: Number(globalData.USGPrice) }
    }
    return { address: USG_CONTRACT.USG, decimals: 18, displayDecimals: 2, symbol: "USG", price: 1 }
  }, [globalData])

  const marketData = useMemo(() => {
    if (!onChainData) return
    return transformMarketData(onChainData, collateralInfo)
  }, [onChainData])

  const futureMarketDisplayData = useMemo(() => {
    return getComputedFutureLoanData(USGInfo?.price, marketData!, collateralInfo, currentAmounts)
  }, [currentAmounts, marketData, USGInfo])

  const marketDisplayData = useMemo(() => {
    return getMarketDisplayData(USGInfo?.price, marketData!, collateralInfo)
  }, [marketData, USGInfo])

  const pricedCollateralInfo = useMemo(() => {
    if (marketData) return { ...collateralInfo, price: Number(formatUnits(marketData?.collateralInfos.collateralUSDPrice, 18)) }
    return collateralInfo
  }, [marketData, collateralInfo])

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
  // USER TRANSACTION HISTORY CONTEXT

  const displayRows = useMemo(() => {
    if (userPositions) {
      const rows = sortUserData(userPositions)

      setIsUserHistoryLoading(false)

      return rows
    } else {
      return []
    }
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

  const currentTotalMarketApr = useMemo(() => {
    if (marketAprs && marketData) {
      const APRS = marketAprs.find((m) => m.marketAddress.toLowerCase() === marketData?.marketAddress.toLowerCase())

      let totalCurrentAPR = 0

      if (!!APRS && APRS?.currentAPR) {
        totalCurrentAPR = Object.values(APRS?.currentAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
        return totalCurrentAPR
      }
    }

    return 0
  }, [marketAprs, marketData])

  // Generate chart data
  useEffect(() => {
    if (marketData && onChainData) {
      const { irParams } = marketData.constants
      const priceRange = 1.005 - 0.9887
      const prices = Array.from({ length: 40 }, (_, i) => 0.9887 + (i * priceRange) / 39)

      const data = prices
        .map((price) => {
          const vAPR = computeVAPR(
            BigInt(Math.round(currentTotalMarketApr * 10 ** 18)) / BigInt(100),
            onChainData?.collateralInfos?.positionCollateralUSDValue,
            onChainData?.debtInfos.userDebt,
            computeIR(BigInt(Math.round(price * 10 ** 18)), irParams),
            debtFarming,
            debtVAPR / 100,
            onChainData?.debtInfos.userDebt,
            isLeveraged,
            initialCollatAmount
          )
          return { price: Number(price.toFixed(4)), vAPR }
        })
        .filter((d) => isFinite(d.vAPR))

      setChartData(data)
    }
  }, [isLeveraged, debtFarming, debtVAPR, marketData, onChainData, initialCollatAmount, currentTotalMarketApr])

  useEffect(() => {
    if (isLeveraged) {
      setDebtFarming(0)
      setDebtVAPR(0)
    } else {
      setInitialCollatAmount(0)
    }
  }, [isLeveraged])

  const feature = useMemo(() => {
    const lastIndexOfSlash = path.lastIndexOf("/") + 1
    const currentFeature = path.substring(lastIndexOfSlash, path.length)
    return currentFeature
  }, [path])

  useEffect(() => {
    const fetchHistoricalMarketData = async (marketData: MarketDetailData) => {
      const currentBlock = await getCurrentBlock()

      const isoEndDate = new Date(Number(currentBlock.timestamp) * 1000).toISOString()
      const dateFrom = encodeURIComponent(isoEndDate)

      const data = await getHistoricalMarketData(marketData?.marketAddress, totalBorrowTimeWindow, dateFrom)

      const mappedTotalBorrowData = mapToTotalBorrow(data)
      setTotalBorrow(mappedTotalBorrowData)
    }

    if (marketData) {
      fetchHistoricalMarketData(marketData)
    }
  }, [totalBorrowTimeWindow, marketData])

  const canLeverage = useMemo(() => {
    return !!USGInfo && USGInfo.price > LEVERAGE_TRESHOLD
  }, [USGInfo])

  const contextValue: USGRecordContextValues = {
    isLoading,
    collateral,
    collateralInfo,
    marketData,
    loadOnChainData,
    USGInfo,
    marketDisplayData,
    futureMarketDisplayData,
    currentAmounts,
    setCurrentAmounts,
    balanceAllowanceData,
    setBalanceAllowanceData,
    fetchBalanceAllowanceData,
    marketInfo,
    //
    displayRows,
    customSort,
    isUserHistoryLoading,
    setIsUserHistoryLoading,
    isLeveraged,
    setIsLeveraged,
    pricedCollateralInfo,

    debtFarming,
    setDebtFarming,

    debtVAPR,
    setDebtVAPR,

    initialCollatAmount,
    setInitialCollatAmount,

    chartData,
    setChartData,
    feature,
    totalBorrow,
    setTotalBorrow,
    totalBorrowTimeWindow,
    setTotalBorrowTimeWindow,
    onChainData,

    canLeverage,
    currentTotalMarketApr,
  }

  return <USGRecordContext.Provider value={contextValue}>{children}</USGRecordContext.Provider>
}

export const useUSGRecordContext = () => {
  const context = useContext(USGRecordContext)
  if (!context) {
    throw new Error("useUSGRecordContext must be used within a USGRecordProvider")
  }
  return context
}
