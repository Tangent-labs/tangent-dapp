"use client"

import { AssetDataPriced, FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doRepay, doRepayAndWithdraw, doZapRepay, doZapRepayAndWithdraw, getRepayFormState } from "./tg_usd_record_repay_controller"
import { maxUint256 } from "viem"
import { getQuote, returnRoute } from "../../global_quote_controller"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"
import { useTgUsdContext } from "../../tg_usd_context"
import { MarketDetailData, ZapToken } from "../../tg_usd_type"
import { computeSwapAssetPrice, doApprove } from "../tg_usd_record_controller"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"
import { toBigInt } from "@/lib/number_formatter"

type TgUsdRepayContextProps = {
  children: ReactNode
}

type TgUsdRepayContextValues = {
  actionRepay: () => void
  formState: FormState

  onClickMax: (e: boolean) => void
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

  marketData?: MarketDetailData

  withdrawPercentage: number
  setWithdrawPercentage: (arg: number) => void

  setRepayAsset: (arg: string) => void
  repayAsset: string

  slippage: number
  setSlippage: (arg: number) => void

  isZapLoading: boolean
  setIsZapLoading: (arg: boolean) => void

  handleRepayValueChange: (arg: bigint | undefined) => void

  tgUdsRepayedValue: bigint | undefined
  setTgUsdRepayedValue: (arg: bigint | undefined) => void

  repayAssetInfo: AssetDataPriced | null

  swapAssetPrice: number | null

  zapRepay: () => void

  actionApprove: () => void

  actionZapRepay: () => void

  isRepayMax: boolean
  setIsRepayMax: (arg: boolean) => void

  isDebtBelowThreshold: boolean
}

export const TgUsdRepayContext = createContext<TgUsdRepayContextValues | undefined>(undefined)

export const TgUsdRepayProvider = ({ children }: TgUsdRepayContextProps) => {
  const { tokens } = useTgUsdContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, loadOnChainData, setCurrentAmounts, fetchBalanceAllowanceData, balanceAllowanceData } = useTgUsdRecordContext()

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [repayWeiValue, setRepayWeiValue] = useState<bigint | undefined>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

  const [withdrawWeiValue, setWithdrawWeiValue] = useState<bigint | undefined>()

  const [repayAsset, setRepayAsset] = useState<string>("tgUSD")

  const [percentage, setPercentage] = useState<number>(0)

  const [slippage, setSlippage] = useState<number>(10)

  const [isRepayMax, setIsRepayMax] = useState<boolean>(false)

  const [isRepayAndWithdraw, setIsRepayAndWithdraw] = useState<boolean>(false)

  const [withdrawPercentage, setWithdrawPercentage] = useState<number>(0)

  const [tgUdsRepayedValue, setTgUsdRepayedValue] = useState<bigint | undefined>()

  const walletClientRef = useRef<ReturnType<typeof getWalletClient> | null>(null)

  useEffect(() => {
    if (isWellConnected && currentAddress) {
      walletClientRef.current = getWalletClient()
    } else {
      walletClientRef.current = null
    }
  }, [isWellConnected, currentAddress, getWalletClient])

  const repayAssetInfo = useMemo<AssetDataPriced | null>(() => {
    if (repayAsset === "ETH") {
      return {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        displayDecimals: 5,
        symbol: "ETH",
        name: "ETH",
        price: swapAssetPrice,
      }
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
    setCurrentAmounts({
      repayWeiValue: !!repayAsset && repayAsset === "tgUSD" ? repayWeiValue || 0n : tgUdsRepayedValue || 0n,
      withdrawWeiValue: withdrawWeiValue || 0n,
    })
  }, [repayWeiValue, withdrawWeiValue, tgUdsRepayedValue])

  const actionZapRepay = () => {
    if (!!withdrawWeiValue && withdrawWeiValue > 0) {
      zapRepayAndWithdraw()
    } else {
      zapRepay()
    }
  }

  const zapRepayAndWithdraw = async () => {
    if (!repayWeiValue || !repayAssetInfo || !marketData || !withdrawWeiValue) return

    setIsZapLoading(true)

    try {
      const repayData = await returnRoute(
        repayAssetInfo?.address,
        TGUSD_CONTRACT?.TG_USD,
        repayWeiValue,
        tgUdsRepayedValue!,
        currentAddress!,
        TGUSD_CONTRACT.ZAPPER
      )

      const zapMarketData = {
        tokenIn: repayAssetInfo?.address,
        amountIn: repayWeiValue,
        minAmountOut: tgUdsRepayedValue!,
      }

      doZapRepayAndWithdraw(marketData?.marketAddress, walletClientRef.current!, repayData!, zapMarketData, withdrawWeiValue)
        .then(() => {
          loadOnChainData()
          setPercentage(0)
          setWithdrawPercentage(0)
          setIsZapLoading(false)
          setRepayWeiValue(0n)
          setWithdrawWeiValue(0n)
          setTgUsdRepayedValue(0n)
          toast.success(ToastComponent, { data: { type: "Success", content: "Transaction successful." } })
        })
        .catch(() => {
          toast.error(ToastComponent, { data: { type: "Error", content: "Transaction failed." } })
          setIsZapLoading(false)
        })
    } catch (error) {
      setIsZapLoading(false)
      console.error("Error in getRouteAndDeposit:", error)
    }
  }

  const zapRepay = async () => {
    if (!repayWeiValue || !repayAssetInfo || !marketData) return

    setIsZapLoading(true)

    try {
      const repayData = await returnRoute(
        repayAssetInfo?.address,
        TGUSD_CONTRACT?.TG_USD,
        repayWeiValue,
        (BigInt(tgUdsRepayedValue || 0n) * BigInt(100 - slippage)) / BigInt(100),
        currentAddress!,
        TGUSD_CONTRACT.ZAPPER
      )

      const zapMarketData = {
        tokenIn: repayAssetInfo?.address,
        amountIn: repayWeiValue,
        minAmountOut: (BigInt(tgUdsRepayedValue || 0n) * BigInt(100 - slippage)) / BigInt(100),
      }

      doZapRepay(marketData?.marketAddress, walletClientRef.current!, repayData!, zapMarketData)
        .then(() => {
          loadOnChainData()
          setPercentage(0)
          setWithdrawPercentage(0)
          setIsZapLoading(false)
          setRepayWeiValue(0n)
          setWithdrawWeiValue(0n)
          setTgUsdRepayedValue(0n)
          toast.success(ToastComponent, { data: { type: "Success", content: "Transaction successful." } })
        })
        .catch(() => {
          toast.error(ToastComponent, { data: { type: "Error", content: "Transaction failed." } })
          setIsZapLoading(false)
        })
    } catch (error) {
      setIsZapLoading(false)
      console.error("Error in getRouteAndDeposit:", error)
    }
  }

  const actionApprove = async () => {
    if (!repayWeiValue || !repayAssetInfo || !marketData) return

    doApprove(walletClientRef.current!, repayAssetInfo?.address, marketData?.marketAddress, repayWeiValue)
      .then(() => {
        loadOnChainData()
        fetchBalanceAllowanceData(repayAssetInfo?.address)
      })
      .catch((err) => {
        const errorMessage = err.message.includes("User denied transaction signature") ? "Transaction aborted" : "Something went wrong"
        toast.error(ToastComponent, { data: { content: errorMessage, type: "Error" } })
      })
  }

  const actionRepay = () => {
    if (!!withdrawWeiValue && withdrawWeiValue > 0) {
      marketRepayAndWithdraw()
    } else {
      marketRepay()
    }
  }

  const marketRepay = () => {
    doRepay(walletClientRef.current!, { marketAddress: marketData!.marketAddress, repayWeiValue: isRepayMax ? maxUint256 : repayWeiValue }).then(() => {
      loadOnChainData()
      setRepayWeiValue(0n)
      setWithdrawWeiValue(0n)
      setPercentage(0)
      setWithdrawPercentage(0)
    })
  }

  const marketRepayAndWithdraw = () => {
    doRepayAndWithdraw(walletClientRef.current!, {
      marketAddress: marketData!.marketAddress,
      repayWeiValue: isRepayMax ? maxUint256 : repayWeiValue,
      withdrawWeiValue,
    }).then(() => {
      loadOnChainData()
      setRepayWeiValue(0n)
      setWithdrawWeiValue(0n)
      setPercentage(0)
      setWithdrawPercentage(0)
    })
  }

  const formState = useMemo(
    () => getRepayFormState(marketData, repayWeiValue, isWellConnected, balanceAllowanceData!, repayAsset),
    [marketData, repayWeiValue, isWellConnected, currentAddress, balanceAllowanceData, repayAsset]
  )

  const marketValues = useMemo(() => {
    if (marketData) {
      if (repayAsset === "tgUSD") {
        const maxRepayableValue = marketData.debtInfos?.userDebt || 0n
        const minimumLoan = marketData.constants.minimumLoan || 0n
        return { maxRepayableValue, minimumLoan }
      } else {
        const maxRepayableInZapAsset =
          (marketData.debtInfos?.userDebt / toBigInt(repayAssetInfo?.price || 1, 18)) * BigInt(10 ** (repayAssetInfo?.decimals || 18))
        const minimumLoanInZapAsset =
          (marketData.constants.minimumLoan / toBigInt(repayAssetInfo?.price || 1, repayAssetInfo?.decimals || 18)) *
          BigInt(10 ** (repayAssetInfo?.decimals || 18))

        return { maxRepayableValue: maxRepayableInZapAsset, minimumLoan: minimumLoanInZapAsset }
      }
    }

    return { maxRepayableValue: 0n, minimumLoan: 0n }
  }, [marketData, repayAssetInfo])

  const maxWithdrawable = useMemo(() => {
    if (marketData) {
      const collateralPriceRaw = marketData?.collateralInfos?.collateralUSDPrice
      const futureDebt = BigInt(marketData?.debtInfos?.userDebt || 0n) - (repayWeiValue || 0n)
      const futureDeposited = BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n)
      const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
      const maxWithDrawable = collateralPriceRaw !== 0n ? futureDeposited - (futureDebt * BigInt(10 ** 18)) / ((collateralPriceRaw * maxLTV) / 100n) : 0n

      return maxWithDrawable > 0n ? maxWithDrawable : 0n
    }

    return 0n
  }, [marketData, repayWeiValue])

  const onClickMax = (isChecked: boolean) => {
    if (isChecked) {
      if (repayAsset !== "tgUSD" && repayAssetInfo && marketData) {
        setIsRepayMax(true)
        setPercentage(100)

        handleRepayValueChange(marketValues?.maxRepayableValue)
      } else {
        setIsRepayMax(true)
        setPercentage(100)
        setRepayWeiValue(marketValues?.maxRepayableValue)
      }
    } else {
      setIsRepayMax(false)
      setRepayWeiValue(0n)
      setPercentage(0)
    }
  }

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
        const { quote } = await getQuote(value, currentAddress, assetInfo?.address, repayAssetInfo?.address)

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

  useEffect(() => {
    const address = repayAssetInfo?.address || TGUSD_CONTRACT.TG_USD
    if (walletClientRef) {
      fetchBalanceAllowanceData(address)
    }
  }, [repayAssetInfo?.address, walletClientRef])

  useEffect(() => {
    if (!repayAsset) return

    const fetchSwapAssetData = async () => {
      setIsZapLoading(true)
      try {
        const data = await computeSwapAssetPrice(tokens, repayAsset)
        setSwapAssetPrice(data || 0)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    fetchSwapAssetData()
  }, [repayAsset])

  const isDebtBelowThreshold = useMemo(() => {
    if (!repayWeiValue || !marketValues?.maxRepayableValue || repayWeiValue === 0n) return false
    if (repayAsset === "tgUSD" && marketValues?.maxRepayableValue === repayWeiValue) return false

    const threshold = marketValues?.minimumLoan
    let adjustedRepayValue = repayWeiValue

    if (repayAsset !== "tgUSD") {
      adjustedRepayValue = tgUdsRepayedValue || 0n
    }

    return (
      marketValues?.maxRepayableValue / BigInt(10 ** (repayAssetInfo?.decimals || 18)) - adjustedRepayValue / BigInt(10 ** 18) < threshold / BigInt(10 ** 18) &&
      marketValues?.maxRepayableValue / BigInt(10 ** (repayAssetInfo?.decimals || 18)) - adjustedRepayValue / BigInt(10 ** 18) > 0n
    )
  }, [repayWeiValue, marketValues, repayAsset, tgUdsRepayedValue])

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
    zapRepay,
    actionApprove,
    onClickMax,
    actionZapRepay,
    isRepayMax,
    setIsRepayMax,
    isDebtBelowThreshold,
    marketData,
    slippage,
    setSlippage,
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
