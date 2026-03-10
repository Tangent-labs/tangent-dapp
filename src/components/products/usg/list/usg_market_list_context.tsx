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
import { ChainViewMarketList, MarketConstants, MarketDebtData, USGCollateralData, USGGlobalData } from "../usg_type"

type USGMaketListContextProps = {
  children: ReactNode
}

type USGMaketListContextValues = {
  displayRows: ListRowData[]
  globalData: USGGlobalData
  searchValue: string | null
  setSearchValue: (value: string | null) => void
  sortMarketList: (arg: ListState) => void

  marketData: Array<{
    marketType: "Convex_CRV" | "Convex_FXN" | "Pendle_PT" | "STAKEDAO_CRV_Vault" | undefined
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
  const { currentAddress, isWalletInitialized } = useWalletConnexionContext()

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
    if (isWalletInitialized) {
      getUSGMarketsData(currentAddress || zeroAddress).then((d) => {
        setOnChainData(d)
      })
    }
  }, [isWalletInitialized])

  /**
   * On user logs in/logs out
   */
  useEffect(() => {
    if (isWalletInitialized && onChainData) {
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
          currentAPR: currentMarket.currentAPR,
          projectedAPR: currentMarket.projectedAPR,
        }
      }

      return {
        marketAddress: market.marketAddress,
        collateral: market.marketName,
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

  const marketData = useMemo<
    Array<{ marketType: "Convex_CRV" | "Convex_FXN" | "Pendle_PT" | "STAKEDAO_CRV_Vault" | undefined; marketAddress: Address; constants: MarketConstants }>
  >(() => {
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

          return {
            name: displayName,
            value: Number(percentage.toFixed(2)),
            rawValue: collateralValue,
          }
        })
        .sort((a, b) => b.value - a.value)

      const marketDebtData = onChainData.rowInfos
        .map((market, index) => {
          const debtValue = market.debtInfos.totalDebt
          const debtFormatted = Number(formatUnits(debtValue, 18))
          const totalDebtFormatted = Number(formatUnits(totalProtocolDebt, 18))

          const { displayName, percentage } = computeCollatData(market, totalDebtFormatted, debtFormatted)

          return {
            id: index + 1,
            name: displayName,
            value: Number(percentage.toFixed(2)),
            rawValue: debtValue,
            marketAddress: market.marketAddress,
          }
        })
        .sort((a, b) => b.value - a.value)

      return { totalUserDebt, totalUserDeposit, totalProtocolDeposit, totalProtocolDebt, USGCollateralsData, marketDebtData }
    }
    return null
  }, [onChainData])

  const sortMarketList = (listState: ListState) => {
    const { key, direction } = listState.sort!

    displayRows.sort((elementA: ListRowData, elementB: ListRowData) => {
      if (key === "vapr") {
        return sortMarketListByType(elementA, elementB, direction)
      } else if (key === "maxvapr") {
        const elementAMaxLeverage = 1 / (1 - elementA?.maxLTV)
        const elementBMaxLeverage = 1 / (1 - elementB?.maxLTV)

        return sortMarketListByType(elementA, elementB, direction, elementAMaxLeverage, elementBMaxLeverage)
      } else if (key === "collateral") {
        const aValue = elementA.token || ""
        const bValue = elementB.token || ""

        const comparison = aValue.localeCompare(bValue)
        return direction === "asc" ? comparison : -comparison
      } else if (key === "borrowed") {
        const aValue = Number(elementA.indicators[2].raw)
        const bValue = Number(elementB.indicators[2].raw)

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
    sortMarketList,
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
