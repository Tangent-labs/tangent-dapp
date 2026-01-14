"use client"

import { USGMarkets } from "../usg_repository"
import { useUSGContext } from "../usg_context"
import { ListRowData, ListState } from "@/types"
import { Address, formatUnits, zeroAddress } from "viem"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { ChainViewMarketList, MarketConstants, MarketDebtData, USGCollateralData, USGGlobalData } from "../usg_type"
import { getUSGMarketsData, transformGlobalData, transformMarketData, transformToRows } from "./usg_market_controller"

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
}

export const USGMaketListContext = createContext<USGMaketListContextValues | undefined>(undefined)

export const USGMarketListProvider = ({ children }: USGMaketListContextProps) => {
  const { currentAddress, isWalletInitialized } = useWalletConnexionContext()

  const { marketAprs } = useUSGContext()

  const [onChainData, setOnChainData] = useState<ChainViewMarketList | undefined>()

  const [searchValue, setSearchValue] = useState<string | null>(null)

  const [marketType, setMarketType] = useState<string>("All")

  const [protocol, setProtocol] = useState<string>("All")

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

  const TYPE_TO_MARKET: Record<string, string> = {
    Convex_CRV: "Curve",
    Convex_FXN: "Convex",
    Pendle_PT: "Pendle",
  }

  const mapProtocol = (p: string): string => {
    return TYPE_TO_MARKET[p]
  }

  const displayRows = useMemo<ListRowData[]>(() => {
    const allRows = transformToRows(marketDataWithAPR, onChainData)

    const filteredRows = allRows
      .filter((market) => {
        if (marketType !== "All") {
          return market.type === marketType
        }
        return true
      })
      .filter((marketProtocol) => {
        if (protocol !== "All") {
          return mapProtocol(marketProtocol.protocol) === protocol
        }
        return true
      })

    if (!searchValue || searchValue.trim() === "") {
      return filteredRows
    }

    const lowered = searchValue.toLowerCase()
    return filteredRows.filter((row) => row.name.toLowerCase().includes(lowered) || row.token.toLowerCase().includes(lowered))
  }, [onChainData, searchValue, marketDataWithAPR, marketType, protocol])

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

          const percentage = totalDepositFormatted > 0 ? (collateralFormatted / totalDepositFormatted) * 100 : 0

          const marketConfig = USGMarkets.find((m) => m.marketAddress === market.marketAddress)

          const marketNameIsDuplicated = marketConfig != null && USGMarkets.filter((m) => m.marketName === marketConfig.marketName).length > 1

          const displayName = (marketNameIsDuplicated && marketConfig?.marketType === "STAKEDAO_CRV_Vault" ? "s-" : "") + marketConfig?.marketName

          return {
            name: displayName,
            value: Number(percentage.toFixed(2)),
          }
        })
        .sort((a, b) => b.value - a.value)

      const marketDebtData = onChainData.rowInfos
        .map((market, index) => {
          const debtValue = market.debtInfos.totalDebt
          const debtFormatted = Number(formatUnits(debtValue, 18))
          const totalDebtFormatted = Number(formatUnits(totalProtocolDebt, 18))

          const percentage = totalDebtFormatted > 0 ? (debtFormatted / totalDebtFormatted) * 100 : 0

          const marketConfig = USGMarkets.find((m) => m.marketAddress === market.marketAddress)

          const marketNameIsDuplicated = marketConfig != null && USGMarkets.filter((m) => m.marketName === marketConfig.marketName).length > 1

          const displayName =
            (marketNameIsDuplicated && marketConfig?.marketType === "STAKEDAO_CRV_Vault" ? "s-" : "") +
            (marketConfig?.marketName || market.collateralInfos?.collateralToken?.symbol)

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
      const aValue = key === "apr" ? Number(elementA.apr?.current) : Number(elementA.indicators.find((el) => el.key === key)?.raw)
      const bValue = key === "apr" ? Number(elementB.apr?.current) : Number(elementB.indicators.find((el) => el.key === key)?.raw)

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
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
