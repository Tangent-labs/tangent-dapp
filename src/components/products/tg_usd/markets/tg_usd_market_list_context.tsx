"use client"

import { ListRowData } from "@/types"
import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { getMarketDatas, mockTgUsdGlobalData, transformMarketDataToRows } from "./tg_usd_market_controller"
import { TgUsdGlobalData } from "../tg_usd_type"

type TgUsdMaketListContextProps = {
  children: ReactNode
}

type TgUsdMaketListContextValues = {
  displayRows: ListRowData[]
  globalData: TgUsdGlobalData
  searchQuery: string
  setSearchQuery: (value: string) => void
}

export const TgUsdMaketListContext = createContext<TgUsdMaketListContextValues | undefined>(undefined)

export const TgUsdMaketListProvider = ({ children }: TgUsdMaketListContextProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("")

  const displayRows = useMemo<ListRowData[]>(() => {
    return getMarketDatas()
      .map((data) => transformMarketDataToRows(data))
      .filter((row) => row.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery])

  const globalData = useMemo<TgUsdGlobalData>(() => {
    return mockTgUsdGlobalData
  }, [])

  const contextValue: TgUsdMaketListContextValues = {
    displayRows,
    globalData,
    searchQuery,
    setSearchQuery,
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
