"use client"

import {
  computeCollatData,
  getUSGMarketsData,
  matchProtocol,
  sortMarketListByType,
  sortMarketsByUserPositionAndTVL,
  transformGlobalData,
  transformMarketData,
  transformToRows,
} from "./usg_market_controller"

import { USGMarkets } from "../usg_repository"
import { useUSGContext } from "../usg_context"
import { ListRowData, ListState } from "@/types"
import { Address, formatUnits, zeroAddress } from "viem"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { ChainViewMarketList, MarketConstants, MarketDebtData, USGCollateralData, USGGlobalData, USGMarketType } from "../usg_type"

type USGMaketListContextProps = {
  children: ReactNode
}

type USGMaketListContextValues = {
  displayRows: ListRowData[]
  globalData: USGGlobalData
  searchValue: string | null
  setSearchValue: (value: string | null) => void
  getSortedRows: (rows: ListRowData[], listState: ListState) => ListRowData[]

  marketData: Array<{
    marketType: USGMarketType | undefined
    marketAddress: Address
    constants: MarketConstants
  }>

  userData: {
    totalUserDebt: bigint
    totalUserDeposit: bigint
    totalProtocolDeposit: bigint
    totalProtocolDebt: bigint
    USGCollateralsData: USGCollateralData[]
    marketDebtData: MarketDebtData[]
  } | null

  marketType: string
  setMarketType: (s: string) => void

  protocol: string
  setProtocol: (s: string) => void

  filteredBy: string
  setFilteredBy: (s: string) => void
}

export const USGMaketListContext = createContext<USGMaketListContextValues | undefined>(undefined)

export const USGMarketListProvider = ({ children }: USGMaketListContextProps) => {
  const { currentAddress, isWalletContextLoaded } = useWalletConnexionContext()

  const { marketAprs } = useUSGContext()

  const [onChainData, setOnChainData] = useState<ChainViewMarketList | undefined>()

  const [searchValue, setSearchValue] = useState<string | null>(null)

  const [marketType, setMarketType] = useState<string>("All")

  const [protocol, setProtocol] = useState<string>("All")

  const [filteredBy, setFilteredBy] = useState<string>("all")

  /**
   * On init
   */
  useEffect(() => {
    if (isWalletContextLoaded) {
      getUSGMarketsData(currentAddress || zeroAddress).then((d) => {
        setOnChainData(d)
      })
    }
  }, [isWalletContextLoaded])

  /**
   * On user logs in/logs out
   */
  useEffect(() => {
    if (isWalletContextLoaded && onChainData) {
      getUSGMarketsData(currentAddress || zeroAddress).then((d) => {
        setOnChainData(d)
      })
    }
  }, [currentAddress])

  const marketDataWithAPR = useMemo(() => {
    return USGMarkets.map((market) => {
      const currentMarket = marketAprs.find((m) => m.marketAddress.toLowerCase() === market.marketAddress.toLowerCase())

      if (currentMarket) {
        return {
          marketAddress: market.marketAddress,
          collateral: market.marketName,
          logoKey: market.logoKey,
          currentAPR: currentMarket.currentAPR,
          projectedAPR: currentMarket.projectedAPR,
        }
      }

      return {
        marketAddress: market.marketAddress,
        collateral: market.marketName,
        logoKey: market.logoKey,
        currentAPR: {},
        projectedAPR: {},
      }
    })
  }, [marketAprs])

  const displayRows = useMemo<ListRowData[]>(() => {
    const allRows = transformToRows(marketDataWithAPR, onChainData)

    const filteredRows = allRows
      .filter((market) => marketType === "All" || market.type === marketType)
      .filter((market) => matchProtocol(market.protocol, protocol))
      .filter((row) => filteredBy === "all" || row.userHasDeposited)

    let rowsToShow = filteredRows

    if (searchValue?.trim()) {
      const lowered = searchValue.toLowerCase().trim()
      rowsToShow = filteredRows.filter((row) => row.name.toLowerCase().includes(lowered) || row.token.toLowerCase().includes(lowered))
    }

    return [...rowsToShow].sort(sortMarketsByUserPositionAndTVL)
  }, [marketDataWithAPR, onChainData, marketType, protocol, filteredBy, searchValue])

  const globalData = useMemo<USGGlobalData>(() => {
    return transformGlobalData(onChainData)
  }, [onChainData])

  const marketData = useMemo<Array<{ marketType: USGMarketType | undefined; marketAddress: Address; constants: MarketConstants }>>(() => {
    if (onChainData) {
      return transformMarketData(onChainData)
    }

    return []
  }, [onChainData])

  const userData = useMemo(() => {
    if (onChainData) {
      let totalUserDebt = 0n
      let totalUserDeposit = 0n
      let totalProtocolDeposit = 0n
      let totalProtocolDebt = 0n

      onChainData?.rowInfos.forEach((market) => {
        totalUserDebt += market.debtInfos.userDebt
        totalUserDeposit += market.collateralInfos.positionCollateralUSDValue
        totalProtocolDeposit += market.collateralInfos?.totalCollateralUSDValue
        totalProtocolDebt += market.debtInfos.totalDebt
      })

      const USGCollateralsData = onChainData.rowInfos
        .map((market) => {
          const collateralValue = market.collateralInfos.totalCollateralUSDValue
          const collateralFormatted = Number(formatUnits(collateralValue, Number(market.collateralInfos?.collateralToken?.decimals)))
          const totalDepositFormatted = Number(formatUnits(totalProtocolDeposit, 18))

          const { displayName, percentage } = computeCollatData(market, totalDepositFormatted, collateralFormatted)

          const marketConfig = USGMarkets.find((m) => m.marketAddress === market.marketAddress)!

          return {
            name: displayName || "",
            value: Number(percentage.toFixed(2)),
            rawValue: collateralValue,
            marketAddress: market.marketAddress,
            logoKey: marketConfig.logoKey,
          }
        })
        .sort((a, b) => b.value - a.value)

      const marketDebtData = onChainData.rowInfos
        .map((market, index) => {
          const debtValue = market.debtInfos.totalDebt
          const debtFormatted = Number(formatUnits(debtValue, 18))
          const totalDebtFormatted = Number(formatUnits(totalProtocolDebt, 18))

          const { displayName, percentage } = computeCollatData(market, totalDebtFormatted, debtFormatted)

          const marketConfig = USGMarkets.find((m) => m.marketAddress === market.marketAddress)!

          return {
            id: index + 1,
            name: displayName || "",
            value: Number(percentage.toFixed(2)),
            rawValue: debtValue,
            marketAddress: market.marketAddress,
            logoKey: marketConfig.logoKey,
          }
        })
        .sort((a, b) => b.value - a.value)

      return { totalUserDebt, totalUserDeposit, totalProtocolDeposit, totalProtocolDebt, USGCollateralsData, marketDebtData }
    }
    return null
  }, [onChainData])

  const getSortedRows = (rows: ListRowData[], listState: ListState) => {
    const { key, direction } = listState.sort!

    return [...rows].sort((elementA, elementB) => {
      if (elementA.isDepositPaused !== elementB.isDepositPaused) {
        return elementA.isDepositPaused ? 1 : -1
      }

      if (key === "default") {
        return sortMarketsByUserPositionAndTVL(elementA, elementB)
      } else if (key === "vapr") {
        return sortMarketListByType(elementA, elementB, direction)
      } else if (key === "maxvapr") {
        const elementAMaxLeverage = Number(elementA?.indicators[1]?.value)
        const elementBMaxLeverage = Number(elementB?.indicators[1]?.value)

        if (elementAMaxLeverage < elementBMaxLeverage) return direction === "asc" ? -1 : 1
        if (elementAMaxLeverage > elementBMaxLeverage) return direction === "asc" ? 1 : -1

        return 0
      } else if (key === "collateral") {
        const aValue = elementA.token || ""
        const bValue = elementB.token || ""

        const comparison = aValue.localeCompare(bValue)
        return direction === "asc" ? comparison : -comparison
      } else if (key === "borrowed") {
        const aValue = Number(elementA.indicators[3].raw)
        const bValue = Number(elementB.indicators[3].raw)

        if (aValue < bValue) return direction === "asc" ? -1 : 1
        if (aValue > bValue) return direction === "asc" ? 1 : -1

        return 0
      } else {
        const aValue = Number(elementA.indicators.find((el) => el.key === key)?.raw)
        const bValue = Number(elementB.indicators.find((el) => el.key === key)?.raw)

        if (aValue < bValue) return direction === "asc" ? -1 : 1
        if (aValue > bValue) return direction === "asc" ? 1 : -1

        return 0
      }
    })
  }

  const contextValue: USGMaketListContextValues = {
    displayRows,
    globalData,
    searchValue,
    setSearchValue,
    marketData,
    userData,
    getSortedRows,
    marketType,
    setMarketType,
    protocol,
    setProtocol,
    filteredBy,
    setFilteredBy,
  }

  return <USGMaketListContext.Provider value={contextValue}>{children}</USGMaketListContext.Provider>
}

export const useUSGMaketListContext = () => {
  const context = useContext(USGMaketListContext)
  if (!context) {
    throw new Error("useUSGMaketListContext must be used within a USGMarketListProvider")
  }
  return context
}
