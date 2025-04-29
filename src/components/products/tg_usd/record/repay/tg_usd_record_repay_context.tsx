"use client"

import { AssetDataPriced, FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketRepay, getRepayFormState } from "./tg_usd_record_repay_controller"
import { formatUnits } from "viem"
import { returnEnsoQuote } from "../../global_quote_controller"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"
import { useTgUsdContext } from "../../tg_usd_context"
import { ZapToken } from "../../tg_usd_type"
import { computeSwapAssetPrice } from "../tg_usd_record_controller"

type TgUsdRepayContextProps = {
  children: ReactNode
}

type TgUsdRepayContextValues = {
  actionRepay: () => void
  formState: FormState

  repayWeiValue?: bigint
  setRepayWeiValue: (arg: bigint | undefined) => void

  maxRepayableValue: bigint

  withdrawWeiValue?: bigint
  setWithdrawWeiValue: (arg: bigint | undefined) => void

  percentage: number
  setPercentage: (arg: number) => void
  isRepayAndWithdraw: boolean
  setIsRepayAndWithdraw: (arg: boolean) => void

  maxWithdrawable: bigint

  withdrawPercentage: number
  setWithdrawPercentage: (arg: number) => void

  setRepayAsset: (arg: string) => void
  repayAsset: string

  isZapLoading: boolean
  setIsZapLoading: (arg: boolean) => void

  handleRepayValueChange: (arg: bigint | undefined) => void

  tgUdsRepayedValue: bigint | undefined
  setTgUsdRepayedValue: (arg: bigint | undefined) => void

  repayAssetInfo: AssetDataPriced | null

  swapAssetPrice: number | null
}

export const TgUsdRepayContext = createContext<TgUsdRepayContextValues | undefined>(undefined)

export const TgUsdRepayProvider = ({ children }: TgUsdRepayContextProps) => {
  const { tokens } = useTgUsdContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, loadOnChainData, setCurrentAmounts, fetchBalanceAllowanceData } = useTgUsdRecordContext()

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [repayWeiValue, setRepayWeiValue] = useState<bigint | undefined>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number | null>(null)

  const [withdrawWeiValue, setWithdrawWeiValue] = useState<bigint | undefined>()

  const [repayAsset, setRepayAsset] = useState<string>("tgUSD")

  const [percentage, setPercentage] = useState<number>(0)

  const [isRepayAndWithdraw, setIsRepayAndWithdraw] = useState<boolean>(false)

  const [withdrawPercentage, setWithdrawPercentage] = useState<number>(0)

  const [tgUdsRepayedValue, setTgUsdRepayedValue] = useState<bigint | undefined>()

  useEffect(() => {
    setCurrentAmounts({
      repayWeiValue: repayWeiValue || 0n,
      withdrawWeiValue: withdrawWeiValue || 0n,
    })
  }, [repayWeiValue, withdrawWeiValue])

  const actionRepay = () => {
    const walletClient = getWalletClient()
    if (walletClient)
      doMarketRepay(walletClient, { marketAddress: marketData!.marketAddress, repayWeiValue, withdrawWeiValue }).then(() => {
        loadOnChainData()
        setRepayWeiValue(0n)
        setWithdrawWeiValue(0n)
        setPercentage(0)
        setWithdrawPercentage(0)
      })
  }

  const formState = useMemo(() => getRepayFormState(marketData, repayWeiValue, isWellConnected), [marketData, repayWeiValue, isWellConnected, currentAddress])

  const marketValues = useMemo(() => {
    if (marketData) {
      const maxRepayableValue = marketData.debtInfos?.userDebt || 0n
      const minimumLoan = marketData.constants.minimumLoan || 0n

      return { maxRepayableValue, minimumLoan }
    }

    return { maxRepayableValue: 0n, minimumLoan: 0n }
  }, [marketData])

  useEffect(() => {
    if (repayWeiValue && marketValues) {
      if (marketValues?.maxRepayableValue - repayWeiValue! > 0n && marketValues?.maxRepayableValue - repayWeiValue! < marketValues?.minimumLoan) {
        const p = Math.round(100 - 300000 / Number(formatUnits(marketValues?.maxRepayableValue, 18)))
        const newValue = marketValues?.maxRepayableValue - marketValues?.minimumLoan

        setTimeout(() => {
          setPercentage(p)
          setRepayWeiValue(newValue)
        }, 500)
      }
    }
  }, [percentage, repayWeiValue, marketValues])

  const maxWithdrawable = useMemo(() => {
    if (marketData) {
      const collateralPriceRaw = BigInt(marketData?.collateralInfos?.collateralUSDPrice || 0n)
      const futureDebt = BigInt(marketData?.debtInfos?.userDebt || 0n)
      const futureDeposited = BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n)
      const futureDepositedDollarRaw = (futureDeposited * collateralPriceRaw) / BigInt(10 ** 18)
      const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
      const maxWithDrawable =
        collateralPriceRaw !== 0n ? futureDepositedDollarRaw - (futureDebt * BigInt(10 ** 18)) / ((collateralPriceRaw * maxLTV) / 100n) : 0n

      return maxWithDrawable
    }

    return 0n
  }, [marketData])

  const handleRepayValueChange = (value: bigint | undefined) => {
    const assetInfo: AssetDataPriced = {
      address: TGUSD_CONTRACT.TG_USD,
      decimals: 18,
      displayDecimals: 2,
      logo: "tgUSD",
      name: "tgUSD",
      price: 1,
      symbol: "tgUSD",
    }

    setRepayWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !currentAddress || !marketData || !repayAssetInfo) return

      setIsZapLoading(true)
      try {
        const quote = await returnEnsoQuote(value, currentAddress, assetInfo?.address, repayAssetInfo?.address, 10)

        if (quote) {
          setTgUsdRepayedValue(quote)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsZapLoading(false)
      }
    }

    fetchZapValue()
  }

  const repayAssetInfo = useMemo(() => {
    if (repayAsset === "ETH") {
      return {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        displayDecimals: 5,
        symbol: "ETH",
        name: "ETH",
        price: swapAssetPrice,
      } as AssetDataPriced
    }

    const assetInfo = tokens.find((el: ZapToken) => el.name === repayAsset || el.symbol === repayAsset) || undefined

    if (!swapAssetPrice || !assetInfo) return null

    const asset: AssetDataPriced = {
      address: assetInfo?.address,
      decimals: assetInfo?.decimals,
      displayDecimals: 2,
      symbol: assetInfo?.symbol,
      name: assetInfo?.name,
      price: swapAssetPrice,
    }

    return asset
  }, [repayAsset, swapAssetPrice])

  useEffect(() => {
    if (repayAssetInfo) {
      fetchBalanceAllowanceData(repayAssetInfo?.address)
    }
  }, [repayAssetInfo])

  useEffect(() => {
    if (!repayAsset) return

    const fetchSwapAssetData = async () => {
      setIsZapLoading(true)
      try {
        const data = await computeSwapAssetPrice(tokens, repayAsset)
        setSwapAssetPrice(data)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    fetchSwapAssetData()
  }, [repayAsset])

  const contextValue: TgUsdRepayContextValues = {
    actionRepay,
    formState,
    repayWeiValue,
    setRepayWeiValue,
    maxRepayableValue: marketValues?.maxRepayableValue,
    percentage,
    setPercentage,
    isRepayAndWithdraw,
    setIsRepayAndWithdraw,
    withdrawWeiValue,
    setWithdrawWeiValue,
    maxWithdrawable,
    withdrawPercentage,
    setWithdrawPercentage,
    repayAsset,
    setRepayAsset,
    isZapLoading,
    setIsZapLoading,
    handleRepayValueChange,
    tgUdsRepayedValue,
    setTgUsdRepayedValue,
    repayAssetInfo,
    swapAssetPrice,
  }

  return <TgUsdRepayContext.Provider value={contextValue}>{children}</TgUsdRepayContext.Provider>
}

export const useTgUsdRepayContext = () => {
  const context = useContext(TgUsdRepayContext)
  if (!context) {
    throw new Error("useTgUsdRepayContext must be used within a TgUsdRepayProvider")
  }
  return context
}
