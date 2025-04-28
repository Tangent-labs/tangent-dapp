"use client"

import { AssetApr, AssetDataPriced, TgUsdMarketAsset } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { ChainViewMarketRow, MarketDetailData, TgUsdMarket, TgUsdMarketAmounts, TgUsdMarketDisplayData, TgUsdMarketLoanDisplayData } from "../tg_usd_type"
import { getComputedFutureLoanData, getMarketApr, getMarketDisplayData, getTgUsdMarketRecordData, transformMarketData } from "./tg_usd_record_controller"

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
  futureMarketDisplayData: TgUsdMarketLoanDisplayData
  marketDisplayData: TgUsdMarketDisplayData
  apr?: AssetApr
  currentAmounts: TgUsdMarketAmounts
  setCurrentAmounts: (amounts: TgUsdMarketAmounts) => void
}

export const TgUsdRecordContext = createContext<TgUsdRecordContextValues | undefined>(undefined)

export const TgUsdRecordProvider = ({ collateral, marketInfo, collateralInfo, children, tgUSDInfo }: TgUsdRecordContextProps) => {
  const [onChainData, setOnChainData] = useState<ChainViewMarketRow | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [apr, setApr] = useState<AssetApr | undefined>()
  const { currentAddress } = useWalletConnexionContext()
  const [currentAmounts, setCurrentAmounts] = useState<TgUsdMarketAmounts>({
    depositWeiValue: 0n,
    borrowWeiValue: 0n,
    withdrawWeiValue: 0n,
    repayWeiValue: 0n,
    zapValue: 0n,
    liquidateValue: 0n,
  })

  useEffect(() => {
    if (currentAddress) {
      loadOnChainData()
    }
  }, [currentAddress])

  useEffect(() => {
    loadApr()
  }, [])

  const loadOnChainData = () => {
    setIsLoading(true)
    getTgUsdMarketRecordData(currentAddress, marketInfo.marketAddress).then((data) => {
      setOnChainData(data)
      setIsLoading(false)
    })
  }

  const loadApr = () => {
    if (marketData?.marketAddress) setApr(getMarketApr(marketInfo.marketAddress))
  }
  const marketData = useMemo(() => {
    if (!onChainData) return
    return transformMarketData(onChainData, collateralInfo)
  }, [onChainData])

  const futureMarketDisplayData = useMemo(() => {
    return getComputedFutureLoanData(marketData, collateralInfo, currentAmounts)
  }, [currentAmounts, marketData])

  const marketDisplayData = useMemo(() => {
    return getMarketDisplayData(marketData, collateralInfo)
  }, [marketData])

  const contextValue: TgUsdRecordContextValues = {
    isLoading,
    collateral,
    collateralInfo,
    marketData,
    loadOnChainData,
    tgUSDInfo,
    marketDisplayData,
    futureMarketDisplayData,
    currentAmounts,
    setCurrentAmounts,
    apr,
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
