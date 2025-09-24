"use client"

import { ListRowData, ListState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { getMarketDatas, getTgUsdMarketsData, transformToRows, transformGlobalData, transformMarketData } from "./tg_usd_market_controller"
import { ChainViewMarketList, MarketConstants, MarketDebtData, TgUsdCollateralData, TgUsdGlobalData } from "../tg_usd_type"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { Address, formatUnits } from "viem"

type TgUsdMaketListContextProps = {
  children: ReactNode
}

type TgUsdMaketListContextValues = {
  displayRows: ListRowData[]
  globalData: TgUsdGlobalData
  searchValue: string | null
  setSearchValue: (value: string | null) => void
  sortMarketList: (arg: ListState) => void

  marketData: Array<{ marketType: "Convex_CRV" | "Convex_FXN" | undefined; marketAddress: Address; constants: MarketConstants }>
  userData: {
    totalUserDebt: bigint
    totalUserDeposit: bigint
    totalProtocolDeposit: bigint
    totalProtocolDebt: bigint
    tgUsdCollateralsData: TgUsdCollateralData[]
    marketDebtData: MarketDebtData[]
  } | null
}

export const TgUsdMaketListContext = createContext<TgUsdMaketListContextValues | undefined>(undefined)

export const TgUsdMaketListProvider = ({ children }: TgUsdMaketListContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const [onChainData, setOnChainData] = useState<ChainViewMarketList | undefined>()

  const [searchValue, setSearchValue] = useState<string | null>(null)

  useEffect(() => {
    if (currentAddress) {
      getTgUsdMarketsData(currentAddress).then((data) => {
        setOnChainData(data)
      })
    }
  }, [currentAddress])

  const displayRows = useMemo<ListRowData[]>(() => {
    const allRows = transformToRows(getMarketDatas(), onChainData)
    if (!searchValue || searchValue.trim() === "") {
      return allRows
    }
    const lowered = searchValue.toLowerCase()
    return allRows.filter((row) => row.name.toLowerCase().includes(lowered) || row.token.toLowerCase().includes(lowered))
  }, [onChainData, searchValue])

  const globalData = useMemo<TgUsdGlobalData>(() => {
    return transformGlobalData(onChainData)
  }, [onChainData])

  const marketData = useMemo<Array<{ marketType: "Convex_CRV" | "Convex_FXN" | undefined; marketAddress: Address; constants: MarketConstants }>>(() => {
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

      const tgUsdCollateralsData = onChainData.rowInfos.map((market) => {
        const value = market.collateralInfos.totalCollateralUSDValue

        const percentage = totalProtocolDeposit > 0n ? (Number(formatUnits(value, 18)) / Number(formatUnits(totalProtocolDeposit, 18))) * 100 : 0

        return {
          name: market.collateralInfos.collateralToken.symbol,
          value: Number(percentage.toFixed(2)),
        }
      })

      const marketDebtData = onChainData.rowInfos
        .map((market, index) => {
          const debtValue = market.debtInfos.totalDebt

          const percentage = totalProtocolDebt > 0 ? (Number(formatUnits(debtValue, 18)) / Number(formatUnits(totalProtocolDebt, 18))) * 100 : 0

          return {
            id: index + 1,
            value: Number(percentage.toFixed(2)),
            name: market?.collateralInfos?.collateralToken?.symbol,
          }
        })
        .sort((a, b) => {
          return a.value > b.value ? -1 : 1
        })

      return { totalUserDebt, totalUserDeposit, totalProtocolDeposit, totalProtocolDebt, tgUsdCollateralsData, marketDebtData }
    }
    return null
  }, [onChainData])

  const sortMarketList = (listState: ListState) => {
    const { key, direction } = listState.sort!

    displayRows.sort((elementA: ListRowData, elementB: ListRowData) => {
      const aValue = Number(elementA.indicators.find((el) => el.key === key)?.raw)
      const bValue = Number(elementB.indicators.find((el) => el.key === key)?.raw)

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const contextValue: TgUsdMaketListContextValues = {
    displayRows,
    globalData,
    searchValue,
    setSearchValue,
    marketData,
    userData,
    sortMarketList,
  }

  return <TgUsdMaketListContext.Provider value={contextValue}>{children}</TgUsdMaketListContext.Provider>
}

export const useTgUsdMaketListContext = () => {
  const context = useContext(TgUsdMaketListContext)
  if (!context) {
    throw new Error("useTgUsdMaketListContext must be used within a TgUsdMaketListProvider")
  }
  return context
}
