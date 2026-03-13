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
} from "../usg_type"

import {
  getComputedFutureLoanData,
  getMarketDisplayData,
  getUSGMarketRecordData,
  getBalancesAndAllowances,
  transformMarketData,
  computeIR,
  computeVAPR,
  mapToTotalBorrow,
  computeLiquidationPrice,
  fetchMarketContracts,
} from "./usg_record_controller"

import { toast } from "react-toastify"
import { usePathname } from "next/navigation"
import { getConvexPools } from "../server_api"
import { useUSGContext } from "../usg_context"
import { USG_CONTRACT } from "../usg_repository"
import { ToastComponent } from "@/components/design_system/toast"
import { Address, formatUnits, parseEther, zeroAddress } from "viem"
import { useRootContext } from "@/components/products/root/root_context"
import { useUSGMaketListContext } from "../list/usg_market_list_context"
import { getHistoricalMarketData, getUserPositions } from "../client_api"
import { sortUserData } from "./position_history/usg_position_history_controller"
import { AssetDataPriced, CollateralInfo, ListState } from "@/types"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { AssetInfos } from "@/components/design_system/inputs/asset_selector"
import { formatNumber } from "@/lib/number_formatter"

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

  maxBorrowCapReached: boolean

  currentConvexTVL: bigint

  displayAPRVariation: boolean

  computedBorrowRate: { current: string; next: string }

  liquidationPrice: bigint

  marketContracts: Array<{ name: string; address: Address }>

  isDepositAndBorrow: boolean
  setIsDepositAndBorrow: (arg: boolean) => void

  isRepayAndWithdraw: boolean
  setIsRepayAndWithdraw: (arg: boolean) => void

  activeTab: string
  setActiveTab: (arg: string) => void

  simulatedCollatAmount: number
  setSimulatedCollatAmount: (n: number) => void

  simulatedDebtAmount: number
  setSimulatedDebtAmount: (n: number) => void

  depositAssetOptions: AssetInfos[]
}

const LEVERAGE_TRESHOLD = 0.989

export const USGRecordContext = createContext<USGRecordContextValues | undefined>(undefined)

export const USGRecordProvider = ({ collateral, marketInfo, collateralInfo, children }: USGRecordContextProps) => {
  const path = usePathname()

  const { marketAprs, balances } = useUSGContext()

  const { getCachedCurrentBlock } = useRootContext()

  const { globalData } = useUSGMaketListContext()

  const [isDepositAndBorrow, setIsDepositAndBorrow] = useState<boolean>(true)

  const [isRepayAndWithdraw, setIsRepayAndWithdraw] = useState<boolean>(false)

  const { currentAddress, walletClient, isWalletInitialized } = useWalletConnexionContext()

  const [chartData, setChartData] = useState<Array<{ price: number; vAPR: number }>>([])

  const [onChainData, setOnChainData] = useState<ChainViewMarketRow | undefined>()

  const [userPositions, setUserPositions] = useState<UserPosition[] | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isLeveraged, setIsLeveraged] = useState<boolean>(false)

  const [totalBorrowTimeWindow, setTotalBorrowTimeWindow] = useState<string>("1m")

  const [debtFarming, setDebtFarming] = useState<number>(0)

  const [debtVAPR, setDebtVAPR] = useState<number>(0)

  const [initialCollatAmount, setInitialCollatAmount] = useState<number>(0)

  const [simulatedCollatAmount, setSimulatedCollatAmount] = useState<number>(0)

  const [simulatedDebtAmount, setSimulatedDebtAmount] = useState<number>(0)

  const [isUserHistoryLoading, setIsUserHistoryLoading] = useState<boolean>(true)

  const [totalBorrow, setTotalBorrow] = useState<TotalBorrow>({ latestTotalDebt: "0", data: [] })

  const [balanceAllowanceData, setBalanceAllowanceData] = useState<BalanceAllowanceData | null>(null)

  const [currentConvexTVL, setCurrentConvexTVL] = useState<bigint>(1n)

  const [activeTab, setActiveTab] = useState<string>("Borrow")

  const [currentAmounts, setCurrentAmounts] = useState<USGMarketAmounts>({
    depositWeiValue: 0n,
    borrowWeiValue: 0n,
    withdrawWeiValue: 0n,
    repayWeiValue: 0n,
    zapValue: 0n,
    liquidateValue: 0n,
  })

  const loadOnChainData = () => {
    setIsLoading(true)
    getUSGMarketRecordData(currentAddress || zeroAddress, marketInfo.marketAddress).then((data) => {
      setOnChainData(data)
      setIsLoading(false)
    })
  }

  /**
   * Loads on chain data when wallet is initialized
   */
  useEffect(() => {
    if (isWalletInitialized) {
      loadOnChainData()
    }
  }, [isWalletInitialized])

  /**
   * Loads on chain data if user logs in/logs out
   */
  useEffect(() => {
    if (isWalletInitialized && onChainData) {
      loadOnChainData()
    }
  }, [currentAddress])

  /**
   * Loads user positions if wallet is initialized and if currentAddress is defined
   */
  useEffect(() => {
    if (isWalletInitialized && currentAddress) {
      getUserPositions(currentAddress!, marketInfo.marketAddress).then((pos) => {
        if (pos) {
          setUserPositions(pos)
        } else {
          setUserPositions([])
        }
      })
    }
  }, [isWalletInitialized, currentAddress])

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
      if (walletClient) {
        const data = await getBalancesAndAllowances(walletClient!, depositAssetInfo, marketInfo?.marketAddress)

        setBalanceAllowanceData(data ? (data[0] as BalanceAllowanceData) : null)
      }
    } catch (error) {
      console.error("Failed to fetch balance/allowance:", error)
    }
  }

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
            onChainData?.collateralInfos?.positionCollateralUSDValue || parseEther(simulatedCollatAmount.toFixed(0)),
            onChainData?.debtInfos.userDebt || parseEther(simulatedDebtAmount.toFixed(0)),
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
  }, [isLeveraged, debtFarming, debtVAPR, marketData, onChainData, initialCollatAmount, currentTotalMarketApr, simulatedCollatAmount, simulatedDebtAmount])

  const feature = useMemo(() => {
    const lastIndexOfSlash = path.lastIndexOf("/") + 1
    const currentFeature = path.substring(lastIndexOfSlash, path.length)
    return currentFeature
  }, [path])

  useEffect(() => {
    const fetchHistoricalMarketData = async (marketData: MarketDetailData) => {
      const currentBlock = await getCachedCurrentBlock()

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

  const maxBorrowCapReached = useMemo(() => {
    if (!marketData) return false

    const maxDebt = marketData.constants.maxMarketDebt
    const totalDebt = marketData.debtInfos?.totalDebt

    return maxDebt <= totalDebt
  }, [marketData])

  const maxMktDbtToastAlreadyShown = useRef(false)

  useEffect(() => {
    if (!marketData) return

    const maxDebt = marketData.constants.maxMarketDebt

    const futureDebt = BigInt(marketData?.debtInfos?.userDebt || 0n) + BigInt(currentAmounts.borrowWeiValue || 0n)

    if (marketData && currentAmounts.borrowWeiValue && maxDebt <= futureDebt && !maxMktDbtToastAlreadyShown.current) {
      toast.info(ToastComponent, {
        data: { type: "Notification", content: "Max debt reached." },
      })

      maxMktDbtToastAlreadyShown.current = true
    }
  }, [maxBorrowCapReached, currentAmounts.borrowWeiValue, marketData])

  const fetchLpConvexData = async (address: Address) => {
    const convexLpData = await getConvexPools()
    const convexCollateralInfo = convexLpData.find((el) => el.lpTokenAddress?.toLowerCase() === address.toLowerCase())
    setCurrentConvexTVL(BigInt((convexCollateralInfo?.convexPoolData?.usdTotal || 0) * 10 ** 18))
  }

  const displayAPRVariation = useMemo(() => {
    return marketInfo?.marketType !== "Pendle_PT"
  }, [marketInfo])

  useEffect(() => {
    if (displayAPRVariation) {
      fetchLpConvexData(collateralInfo?.address)
    }
  }, [collateralInfo?.address, displayAPRVariation])

  const computedBorrowRate = useMemo(() => {
    return {
      current: `${((Math.exp(marketDisplayData.borrowRateCurrent) - 1) * 100).toFixed(2)}%`,
      next: `${((Math.exp(marketDisplayData.borrowRateNext) - 1) * 100).toFixed(2)}%`,
    }
  }, [marketDisplayData])

  const liquidationPrice = useMemo(() => {
    if (marketData && collateralInfo) return computeLiquidationPrice(collateralInfo, marketData, currentAmounts) * 100n
    return 0n
  }, [marketData, currentAmounts])

  const marketContracts = useMemo(() => {
    if (marketData?.collateralInfo) {
      return fetchMarketContracts(marketData?.collateralInfo?.name)
    }
    return []
  }, [marketData])

  const depositAssetOptions: AssetInfos[] = useMemo(() => {
    if (!!marketData && !!balances) {
      const gaugeSymbol = `Gauge ${collateralInfo?.symbol}`

      const balCollatWei = balances?.[collateralInfo?.address] ?? 0n
      const balCollatNumber = Number(formatUnits(balCollatWei, collateralInfo?.decimals))

      const receiptCollat = balances?.[marketData?.constants?.receipt] ?? 0n
      const receiptNumber = Number(formatUnits(receiptCollat, collateralInfo?.decimals))

      return [
        {
          label: collateralInfo?.symbol,
          value: collateralInfo?.symbol,
          address: collateralInfo?.address,
          balanceWei: balCollatWei,
          balanceNumber: balCollatNumber,
          balanceFormatted: formatNumber(balCollatNumber, 2),
          symbol: collateralInfo?.symbol,
          logo: collateralInfo?.symbol,
          decimals: collateralInfo.decimals,
          displayDecimals: 2,
        },
        {
          label: gaugeSymbol,
          value: gaugeSymbol,
          address: marketData?.constants?.receipt,
          balanceWei: receiptCollat,
          balanceNumber: receiptNumber,
          balanceFormatted: formatNumber(receiptNumber, 2),
          symbol: gaugeSymbol,
          logo: collateralInfo?.symbol,
          decimals: collateralInfo.decimals,
          displayDecimals: 2,
        },
      ]
    }
    return []
  }, [collateralInfo, marketData, balances])

  const contextValue: USGRecordContextValues = {
    isLoading,
    collateral,
    collateralInfo: pricedCollateralInfo,
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

    maxBorrowCapReached,

    currentConvexTVL,

    displayAPRVariation,

    computedBorrowRate,

    liquidationPrice,

    marketContracts,

    isDepositAndBorrow,
    setIsDepositAndBorrow,

    isRepayAndWithdraw,
    setIsRepayAndWithdraw,

    activeTab,
    setActiveTab,

    depositAssetOptions,

    simulatedCollatAmount,
    setSimulatedCollatAmount,

    simulatedDebtAmount,
    setSimulatedDebtAmount,
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
