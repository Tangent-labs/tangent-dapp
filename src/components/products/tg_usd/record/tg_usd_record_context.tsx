"use client"

import { AssetDataPriced, TgUsdMarketAsset } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { ChainViewMarketRow, MarketDetailData, TgUsdMarket } from "../tg_usd_type"
import { getTgUsdMarketRecordData, transformMarketData } from "./tg_usd_record_controller"

type TgUsdRecordContextProps = {
  children: ReactNode
  collateral: TgUsdMarketAsset
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
  tgUSDInfo: AssetDataPriced
}

type TgUsdRecordContextValues = {
  collateral: TgUsdMarketAsset
  collateralInfo: AssetDataPriced
  isLoading: boolean
  marketData?: MarketDetailData
  loadOnChainData: () => void
  tgUSDInfo: AssetDataPriced
}

export const TgUsdRecordContext = createContext<TgUsdRecordContextValues | undefined>(undefined)

export const TgUsdRecordProvider = ({ collateral, marketInfo, collateralInfo, children, tgUSDInfo }: TgUsdRecordContextProps) => {
  const [onChainData, setOnChainData] = useState<ChainViewMarketRow | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    loadOnChainData()
  }, [currentAddress])

  const loadOnChainData = () => {
    setIsLoading(true)
    getTgUsdMarketRecordData(currentAddress, marketInfo.marketAddress).then((data) => {
      setOnChainData(data)
      setIsLoading(false)
    })
  }

  const marketData = useMemo(() => {
    if (!onChainData) return
    return transformMarketData(onChainData, collateralInfo)
  }, [onChainData])

  const contextValue: TgUsdRecordContextValues = {
    isLoading,
    collateral,
    collateralInfo,
    marketData,
    loadOnChainData,
    tgUSDInfo,
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
