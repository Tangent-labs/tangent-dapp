"use client"

import { AssetDataPriced, TgUsdMarketAsset } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { ChainViewMarketRow, TgUsdMarket } from "../tg_usd_type"
import { getTgUsdMarketRecordData } from "./tg_usd_record_controller"

type TgUsdRecordContextProps = {
  children: ReactNode
  collateral: TgUsdMarketAsset
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
}

type TgUsdRecordContextValues = {
  collateral: TgUsdMarketAsset
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
  isLoading: boolean
  onChainData?: ChainViewMarketRow
}

export const TgUsdRecordContext = createContext<TgUsdRecordContextValues | undefined>(undefined)

export const TgUsdRecordProvider = ({ collateral, marketInfo, collateralInfo, children }: TgUsdRecordContextProps) => {
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

  const contextValue: TgUsdRecordContextValues = {
    isLoading,
    collateral,
    collateralInfo,
    marketInfo,
    onChainData,
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
