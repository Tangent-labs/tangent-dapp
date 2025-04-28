"use client"

import { AssetApr, AssetDataPriced, TgUsdMarketAsset } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import {
  BalanceAllowanceData,
  ChainViewMarketRow,
  MarketDetailData,
  TgUsdMarket,
  TgUsdMarketAmounts,
  TgUsdMarketDisplayData,
  TgUsdMarketLoanDisplayData,
} from "../tg_usd_type"
import {
  getBalances,
  getComputedFutureLoanData,
  getMarketApr,
  getMarketDisplayData,
  getTgUsdMarketRecordData,
  getZapTokenBalanceAllowance,
  transformMarketData,
} from "./tg_usd_record_controller"
import { Address } from "viem"
import { useTgUsdContext } from "../tg_usd_context"

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
  fetchBalanceAllowanceData: (address: Address) => void
  tgUSDInfo: AssetDataPriced
  futureMarketDisplayData: TgUsdMarketLoanDisplayData
  marketDisplayData: TgUsdMarketDisplayData
  apr?: AssetApr
  currentAmounts: TgUsdMarketAmounts
  setCurrentAmounts: (amounts: TgUsdMarketAmounts) => void

  balances: Record<Address, bigint> | null

  balanceAllowanceData: BalanceAllowanceData | null
  setBalanceAllowanceData: (arg: BalanceAllowanceData) => void
}

export const TgUsdRecordContext = createContext<TgUsdRecordContextValues | undefined>(undefined)

export const TgUsdRecordProvider = ({ collateral, marketInfo, collateralInfo, children, tgUSDInfo }: TgUsdRecordContextProps) => {
  const { tokens } = useTgUsdContext()

  const { currentAddress, getWalletClient } = useWalletConnexionContext()

  const [balances, setBalances] = useState<Record<Address, bigint> | null>(null)

  const [onChainData, setOnChainData] = useState<ChainViewMarketRow | undefined>()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [apr, setApr] = useState<AssetApr | undefined>()

  const [balanceAllowanceData, setBalanceAllowanceData] = useState<BalanceAllowanceData | null>(null)

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

  useEffect(() => {
    const tokenAddresses: Address[] = tokens.map((el) => el.address)

    if (currentAddress && tokenAddresses.length > 0) {
      getBalances(currentAddress, tokenAddresses).then((data) => {
        if (data) {
          const tokenBalances = tokenAddresses.reduce(
            (acc, address, index) => {
              acc[address] = data[index] || BigInt(0)
              return acc
            },
            {} as Record<Address, bigint>
          )
          setBalances(tokenBalances)
        }
      })
    }
  }, [currentAddress, tokens])

  const fetchBalanceAllowanceData = async (depositAssetInfo: Address) => {
    if (!depositAssetInfo) return

    try {
      const walletClient = getWalletClient()
      if (!walletClient || !marketInfo) throw new Error("Wallet client not found")

      const data = await getZapTokenBalanceAllowance(walletClient, depositAssetInfo, marketInfo?.marketAddress)

      setBalanceAllowanceData(data ? (data[0] as BalanceAllowanceData) : null)
    } catch (error) {
      console.error("Failed to fetch balance/allowance:", error)
    }
  }

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
    balances,
    balanceAllowanceData,
    setBalanceAllowanceData,
    fetchBalanceAllowanceData,
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
