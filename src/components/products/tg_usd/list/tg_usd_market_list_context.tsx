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
}

export const TgUsdMaketListContext = createContext<TgUsdMaketListContextValues | undefined>(undefined)

export const TgUsdMaketListProvider = ({ children }: TgUsdMaketListContextProps) => {
  const { currentAddress } = useWalletConnexionContext()
  const [onChainData, setOnChainData] = useState<ChainViewMarketList | undefined>()

  useEffect(() => {
    loadOnChainData().then((data) => {
      //console.log("setOnChainData", data)
      setOnChainData(data)
    })
  }, [currentAddress])

  const loadOnChainData = async () => {
    return getTgUsdMarketsData(currentAddress)
  }

  const displayRows = useMemo<ListRowData[]>(() => {
    return transformToRows(getMarketDatas(), onChainData)
  }, [onChainData])

  const globalData = useMemo<TgUsdGlobalData>(() => {
    return transformGlobalData(onChainData)
  }, [onChainData])

  const contextValue: TgUsdMaketListContextValues = {
    displayRows,
    globalData,
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
