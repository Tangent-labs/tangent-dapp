"use client"

import { ListRowData } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { getMarketDatas, getTgUsdMarketsData, transformToRows, transformGlobalData } from "./tg_usd_market_controller"
import { ChainViewMarketList, TgUsdGlobalData } from "../tg_usd_type"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"

type TgUsdMaketListContextProps = {
  children: ReactNode
}

type TgUsdMaketListContextValues = {
  displayRows: ListRowData[]
  globalData: TgUsdGlobalData
  searchValue: string | null
  setSearchValue: (value: string | null) => void
}

export const TgUsdMaketListContext = createContext<TgUsdMaketListContextValues | undefined>(undefined)

export const TgUsdMaketListProvider = ({ children }: TgUsdMaketListContextProps) => {
  const { currentAddress } = useWalletConnexionContext()
  const [onChainData, setOnChainData] = useState<ChainViewMarketList | undefined>()
  const [searchValue, setSearchValue] = useState<string | null>(null)

  useEffect(() => {
    loadOnChainData().then((data) => {
      setOnChainData(data)
    })
  }, [currentAddress])

  const loadOnChainData = async () => {
    return getTgUsdMarketsData(currentAddress)
  }

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

  const contextValue: TgUsdMaketListContextValues = {
    displayRows,
    globalData,
    searchValue,
    setSearchValue,
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
