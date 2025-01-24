"use client"

import { AssetApr, AssetDataPriced, TgUsdMarketAsset } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { ChainViewMarketRow, MarketDetailData, TgUsdMarket, TgUsdMarketDisplayData, TgUsdMarketLoanDisplayData } from "../tg_usd_type"
import { getComputedLoanData, getTgUsdMarketRecordData, transformMarketData } from "./tg_usd_record_controller"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { formatEther } from "viem"

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
}

export const TgUsdRecordContext = createContext<TgUsdRecordContextValues | undefined>(undefined)

export const TgUsdRecordProvider = ({ collateral, marketInfo, collateralInfo, children, tgUSDInfo }: TgUsdRecordContextProps) => {
  const [onChainData, setOnChainData] = useState<ChainViewMarketRow | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [apr, setApr] = useState<AssetApr | undefined>()
  const { currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    loadOnChainData()
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
    setApr({
      actualsApr: {
        details: { baseApr: 0.03, boostApr: 0.02, type: "variable" },
        totalApr: 2.5,
      },
      projectedApr: {
        details: { baseApr: 0.03, boostApr: 0.02, type: "variable" },
        totalApr: 4,
      },
      boostsData: {},
    })
  }

  const marketData = useMemo(() => {
    if (!onChainData) return
    return transformMarketData(onChainData, collateralInfo)
  }, [onChainData])

  const marketDisplayData = useMemo(() => {
    if (!marketData)
      return {
        tvl: "-",
        borrowed: "-",
        cap: "-",
        deposited: "-",
        collateralValue: "-",
        debt: "-",
        health: "-",
        ltv: "-",
        maxBorrowable: "-",
        maxWithdrawable: "-",
        depositedDollar: "-",
        tvlDollar: "-",
        borrowRateCurrent: "-",
        borrowRateNext: "-",
        lt: "-",
        ltDollar: "-",
        maxLtv: "-",
        maxLtvDollar: "-",
        rewardsCutCurrent: "-",
        rewardsCutNext: "-",
      } as TgUsdMarketDisplayData

    const { maxBorrowable, maxWithDrawable, currentLtv, maxLTV, maxMarketDebt } = getComputedLoanData(marketData)

    return {
      tvl: formatNumber(Number(formatEther(BigInt(marketData?.collateralInfos?.totalCollateralAmount || 0n))), 0),
      tvlDollar: formatDollar(Number(formatEther(BigInt(marketData?.collateralInfos?.totalCollateralUSDValue || 0n))), 0),
      borrowed: formatDollar(Number(formatEther(BigInt(marketData?.debtInfos?.totalDebt || 0n))), 0),
      cap: formatDollar(Number(formatEther(BigInt(maxMarketDebt || 0n))), 2),
      deposited: formatNumber(Number(formatEther(BigInt(marketData?.collateralInfos.positionCollateralAmount || 0n))), 0),
      depositedDollar: formatDollar(Number(formatEther(BigInt(marketData?.collateralInfos.positionCollateralUSDValue || 0n))), 0),
      collateralValue: formatDollar(Number(formatEther(BigInt(marketData?.collateralInfos?.positionCollateralUSDValue || 0n))), 0),
      debt: formatDollar(Number(formatEther(BigInt(marketData?.debtInfos.positionDebt || 0n))), 0),
      health: formatNumber(Number(formatEther(BigInt(marketData?.debtInfos.healthRatio || 0n))), 2),
      ltv: formatNumber(Number(BigInt(currentLtv || 0n)) / 1000, 2) + "%",
      maxBorrowable: formatDollar(Number(formatEther(BigInt(maxBorrowable || 0n))), 0),
      maxWithdrawable: formatDollar(Number(formatEther(BigInt(maxWithDrawable || 0n))), 0),
      borrowRateCurrent: formatNumber(Number(formatEther(BigInt(marketData?.debtInfos.currentBorrowRate || 0n))), 2) + "%",
      borrowRateNext: formatNumber(Number(formatEther(BigInt(marketData?.debtInfos.futureBorrowRate || 0n))), 2) + "%",
      lt: formatNumber(Number(formatEther(BigInt(marketData?.constants.liquidationThreshold || 0n))), 2) + "%",
      ltDollar: "-",
      maxLtv: formatNumber(Number(BigInt(maxLTV || 0n)), 2) + "%",
      maxLtvDollar: formatDollar(Number(formatEther(BigInt(maxMarketDebt || 0n))), 2),
      rewardsCutCurrent: formatNumber(Number(formatEther(BigInt(marketData?.debtInfos.currentRewardCut || 0n))), 2) + "%",
      rewardsCutNext: formatNumber(Number(formatEther(BigInt(marketData?.debtInfos.futureRewardCut || 0n))), 2) + "%",
    } as TgUsdMarketDisplayData
  }, [marketData])

  const futureMarketDisplayData = useMemo(() => {
    //todo : Add the result when the chain view is ready.
    return {
      collateralValue: "-",
      debt: "-",
      health: "-",
      ltv: "-",
      maxBorrowable: "-",
      maxWithdrawable: "-",
    } as TgUsdMarketLoanDisplayData
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
