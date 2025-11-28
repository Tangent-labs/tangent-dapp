"use client"

import { toast } from "react-toastify"
import { ZapToken } from "../../tg_usd_type"
import { formatUnits, maxUint256 } from "viem"
import { useUSGContext } from "../../tg_usd_context"
import { AssetDataPriced, FormState } from "@/types"
import { USG_CONTRACT } from "../../tg_usd_repository"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { ToastComponent } from "@/components/design_system/toast"
import { getQuote, getRoute } from "../../global_quote_controller"
import { useRootContext } from "@/components/products/root/root_context"
import { computeSwapAssetPrice, doApprove } from "../tg_usd_record_controller"
import { formatBigIntAsNumber, formatDollar, toBigInt } from "@/lib/number_formatter"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { doRepay, doRepayAndWithdraw, doZapRepay, doZapRepayAndWithdraw, getRepayFormState } from "./usg_record_repay_controller"

type USGRepayContextProps = {
  children: ReactNode
}

type USGRepayContextValues = {
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

  withdrawPercentage: number
  setWithdrawPercentage: (arg: number) => void

  setRepayAsset: (arg: string) => void
  repayAsset: string

  slippage: number
  setSlippage: (arg: number) => void

  isZapLoading: boolean
  setIsZapLoading: (arg: boolean) => void

  handleRepayValueChange: (arg: bigint | undefined) => void

  usgRepayedValue: bigint | undefined
  setUsgRepayedValue: (arg: bigint | undefined) => void

  repayAssetInfo: AssetDataPriced | null

  swapAssetPrice: number | null

  zapRepay: () => void

  actionApprove: () => void

  actionZapRepay: () => void

  isRepayMax: boolean
  setIsRepayMax: (arg: boolean) => void

  isDebtBelowThreshold: boolean

  tgUsdDollarRepayedValue: string

  currentQuotePriceImpact: bigint | undefined

  expectedUSG: string
}

export const USGRepayContext = createContext<USGRepayContextValues | undefined>(undefined)

export const USGRepayProvider = ({ children }: USGRepayContextProps) => {
  const { curveRoutes, handleQuote } = useRootContext()

  const { tokens, loadUSGsUSGMetrics } = useUSGContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, USGInfo, balanceAllowanceData, loadOnChainData, setCurrentAmounts, fetchBalanceAllowanceData } = useUSGRecordContext()

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [repayWeiValue, setRepayWeiValue] = useState<bigint | undefined>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

  const [withdrawWeiValue, setWithdrawWeiValue] = useState<bigint | undefined>()

  const [repayAsset, setRepayAsset] = useState<string>("USG")

  const [percentage, setPercentage] = useState<number>(0)

  const [slippage, setSlippage] = useState<number>(1)

  const [isRepayMax, setIsRepayMax] = useState<boolean>(false)

  const [isRepayAndWithdraw, setIsRepayAndWithdraw] = useState<boolean>(false)

  const [withdrawPercentage, setWithdrawPercentage] = useState<number>(0)

  const [usgRepayedValue, setUsgRepayedValue] = useState<bigint | undefined>()

  const [currentQuotePriceImpact, setCurrentQuotePriceImpact] = useState<bigint | undefined>(undefined)

  const walletClientRef = useRef<ReturnType<typeof getWalletClient> | null>(null)

  useEffect(() => {
    if (!isRepayAndWithdraw) {
      setWithdrawWeiValue(0n)
      setWithdrawPercentage(0)
    }
  }, [isRepayAndWithdraw])

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
      repayWeiValue: !!repayAsset && repayAsset === "USG" ? repayWeiValue || 0n : usgRepayedValue || 0n,
      withdrawWeiValue: withdrawWeiValue || 0n,
    })
  }, [repayWeiValue, withdrawWeiValue, usgRepayedValue])

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
      const repayData = await getRoute(
        repayAssetInfo?.address,
        USG_CONTRACT?.USG,
        repayWeiValue,
        usgRepayedValue!,
        currentAddress!,
        USG_CONTRACT.ZAPPER,
        curveRoutes
      )

      const zapMarketData = {
        tokenIn: repayAssetInfo?.address,
        amountIn: repayWeiValue,
        minAmountOut: usgRepayedValue!,
      }

      doZapRepayAndWithdraw(marketData?.marketAddress, walletClientRef.current!, repayData!, zapMarketData, withdrawWeiValue)
        .then(() => {
          resetAfterRepaySuccess()
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
      const repayData = await getRoute(
        repayAssetInfo?.address,
        USG_CONTRACT?.USG,
        repayWeiValue,
        (BigInt(usgRepayedValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        currentAddress!,
        USG_CONTRACT.ZAPPER,
        curveRoutes
      )

      const zapMarketData = {
        tokenIn: repayAssetInfo?.address,
        amountIn: repayWeiValue,
        minAmountOut: (BigInt(usgRepayedValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
      }

      doZapRepay(marketData?.marketAddress, walletClientRef.current!, repayData!, zapMarketData)
        .then(() => {
          resetAfterRepaySuccess()
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
    doRepay(walletClientRef.current!, {
      marketAddress: marketData!.marketAddress,
      repayWeiValue: isRepayMax || percentage === 100 ? maxUint256 : repayWeiValue,
    }).then(() => {
      resetAfterRepaySuccess()
    })
  }

  const marketRepayAndWithdraw = () => {
    doRepayAndWithdraw(walletClientRef.current!, {
      marketAddress: marketData!.marketAddress,
      repayWeiValue: isRepayMax || percentage === 100 ? maxUint256 : repayWeiValue,
      withdrawWeiValue,
    }).then(() => {
      resetAfterRepaySuccess()
    })
  }

  const resetAfterRepaySuccess = () => {
    loadOnChainData()
    setPercentage(0)
    setWithdrawPercentage(0)
    setIsZapLoading(false)
    setRepayWeiValue(0n)
    setWithdrawWeiValue(0n)
    setUsgRepayedValue(0n)
    loadUSGsUSGMetrics()
  }

  const formState = useMemo(() => {
    if (marketData) {
      return getRepayFormState(marketData, repayWeiValue, isWellConnected, balanceAllowanceData!, repayAsset)
    }

    return { canProcess: false, cantProcessReasons: [], haveToApprove: false }
  }, [marketData, repayWeiValue, isWellConnected, currentAddress, balanceAllowanceData, repayAsset])

  const marketValues = useMemo(() => {
    if (marketData && currentAddress) {
      if (repayAsset === "USG") {
        const maxRepayableValue = marketData.debtInfos?.userDebt || 0n
        const minimumLoan = marketData.constants.minimumLoan || 0n
        return { maxRepayableValue, minimumLoan }
      } else if (marketData && repayAssetInfo) {
        const maxRepayableInZapAsset = (marketData.debtInfos?.userDebt / toBigInt(repayAssetInfo?.price, 18)) * BigInt(10 ** (repayAssetInfo?.decimals || 18))
        const minimumLoanInZapAsset =
          (marketData.constants.minimumLoan / toBigInt(repayAssetInfo?.price, repayAssetInfo?.decimals || 18)) * BigInt(10 ** (repayAssetInfo?.decimals || 18))

        return { maxRepayableValue: maxRepayableInZapAsset, minimumLoan: minimumLoanInZapAsset }
      }
    }

    return { maxRepayableValue: 0n, minimumLoan: 0n }
  }, [marketData, repayAssetInfo, currentAddress])

  const maxWithdrawable = useMemo(() => {
    if (marketData && currentAddress) {
      const collateralPriceRaw = marketData?.collateralInfos?.collateralUSDPrice

      const computedRepayWeiValue = !!repayAsset && repayAsset === "USG" ? repayWeiValue : usgRepayedValue

      const futureDebt = BigInt(marketData?.debtInfos?.userDebt || 0n) - (computedRepayWeiValue || 0n)

      const futureDeposited = BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n)
      const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
      const maxWithDrawable = collateralPriceRaw !== 0n ? futureDeposited - (futureDebt * BigInt(10 ** 18)) / ((collateralPriceRaw * maxLTV) / 100n) : 0n

      return maxWithDrawable > 0n ? maxWithDrawable : 0n
    }

    return 0n
  }, [marketData, repayWeiValue, usgRepayedValue, currentAddress])

  const onClickMax = (isChecked: boolean) => {
    if (isChecked) {
      if (repayAsset !== "USG" && repayAssetInfo && marketData) {
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
    setRepayWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !currentAddress || !marketData || !repayAssetInfo) return

      setIsZapLoading(true)
      try {
        const { quote, priceImpact } = await getQuote(value, currentAddress, USG_CONTRACT.USG, repayAssetInfo?.address, curveRoutes)

        handleQuote(quote)

        if (quote) {
          setUsgRepayedValue(quote)
          setCurrentQuotePriceImpact(priceImpact)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsZapLoading(false)
      }
    }

    if (!!repayAssetInfo && repayAssetInfo?.symbol !== "USG") {
      fetchZapValue()
    }
  }

  useEffect(() => {
    const address = repayAssetInfo?.address || USG_CONTRACT.USG
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
    if (repayAsset === "USG" && marketValues?.maxRepayableValue === repayWeiValue) return false

    const threshold = marketValues?.minimumLoan
    let adjustedRepayValue = repayWeiValue

    if (repayAsset !== "USG") {
      adjustedRepayValue = usgRepayedValue || 0n
    }

    const value = marketValues?.maxRepayableValue / BigInt(10 ** (repayAssetInfo?.decimals || 18)) - adjustedRepayValue / BigInt(10 ** 18)

    return value < threshold / BigInt(10 ** 18) && value > 0n
  }, [repayWeiValue, marketValues, repayAsset, usgRepayedValue])

  const tgUsdDollarRepayedValue = useMemo(() => {
    return `(~${formatDollar((Number(Number(formatUnits(usgRepayedValue || 0n, 18))) * USGInfo?.price).toFixed(2))})`
  }, [usgRepayedValue, USGInfo])

  const expectedUSG = useMemo(() => {
    if (marketData) {
      if (usgRepayedValue && repayAsset && repayAsset !== "USG") {
        return `${formatBigIntAsNumber(BigInt(usgRepayedValue || 0n), 18, 2)} USG`
      } else if (repayAsset && repayAsset === "USG" && repayWeiValue) {
        return `${formatBigIntAsNumber(repayWeiValue || 0n, 18, 2)}  USG`
      }
    }
    return "0 USG"
  }, [usgRepayedValue, repayWeiValue, repayAsset, marketData])

  const contextValue: USGRepayContextValues = {
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
    usgRepayedValue,
    setUsgRepayedValue,
    repayAssetInfo,
    swapAssetPrice,
    zapRepay,
    actionApprove,
    onClickMax,
    actionZapRepay,
    isRepayMax,
    setIsRepayMax,
    isDebtBelowThreshold,
    slippage,
    setSlippage,
    tgUsdDollarRepayedValue,
    currentQuotePriceImpact,
    expectedUSG,
  }

  return <USGRepayContext.Provider value={contextValue}>{children}</USGRepayContext.Provider>
}

export const useUSGRepayContext = () => {
  const context = useContext(USGRepayContext)
  if (!context) {
    throw new Error("useUSGRepayContext must be used within a TgUsdRepayProvider")
  }
  return context
}
