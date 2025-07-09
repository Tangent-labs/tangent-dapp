"use client"

import { AssetDataPriced, FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doRepay, doRepayAndWithdraw, doZapRepay, doZapRepayAndWithdraw, getRepayFormState } from "./tg_usd_record_repay_controller"
import { formatUnits, maxUint256 } from "viem"
import { getQuote, returnRoute } from "../../global_quote_controller"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"
import { useTgUsdContext } from "../../tg_usd_context"
import { MarketDetailData, ZapToken } from "../../tg_usd_type"
import { computeSwapAssetPrice, doApprove } from "../tg_usd_record_controller"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"
import { formatDollar, toBigInt } from "@/lib/number_formatter"

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
}

export const TgUsdRepayContext = createContext<TgUsdRepayContextValues | undefined>(undefined)

export const TgUsdRepayProvider = ({ children }: TgUsdRepayContextProps) => {
  const { tokens } = useTgUsdContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, tgUSDInfo, loadOnChainData, setCurrentAmounts, fetchBalanceAllowanceData, balanceAllowanceData } = useTgUsdRecordContext()

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
      const repayData = await returnRoute(repayAssetInfo?.address, TGUSD_CONTRACT?.USG, repayWeiValue, usgRepayedValue!, currentAddress!, TGUSD_CONTRACT.ZAPPER)

      const zapMarketData = {
        tokenIn: repayAssetInfo?.address,
        amountIn: repayWeiValue,
        minAmountOut: usgRepayedValue!,
      }

      doZapRepayAndWithdraw(marketData?.marketAddress, walletClientRef.current!, repayData!, zapMarketData, withdrawWeiValue)
        .then(() => {
          loadOnChainData()
          setPercentage(0)
          setWithdrawPercentage(0)
          setIsZapLoading(false)
          setRepayWeiValue(0n)
          setWithdrawWeiValue(0n)
          setUsgRepayedValue(0n)
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
        TGUSD_CONTRACT?.USG,
        repayWeiValue,
        (BigInt(usgRepayedValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        currentAddress!,
        TGUSD_CONTRACT.ZAPPER
      )

      const zapMarketData = {
        tokenIn: repayAssetInfo?.address,
        amountIn: repayWeiValue,
        minAmountOut: (BigInt(usgRepayedValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
      }

      doZapRepay(marketData?.marketAddress, walletClientRef.current!, repayData!, zapMarketData)
        .then(() => {
          loadOnChainData()
          setPercentage(0)
          setWithdrawPercentage(0)
          setIsZapLoading(false)
          setRepayWeiValue(0n)
          setWithdrawWeiValue(0n)
          setUsgRepayedValue(0n)
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
      repayWeiValue: isRepayMax || percentage === 100 ? maxUint256 : repayWeiValue,
      withdrawWeiValue,
    }).then(() => {
      loadOnChainData()
      setRepayWeiValue(0n)
      setWithdrawWeiValue(0n)
      setPercentage(0)
      setWithdrawPercentage(0)
    })
  }

  const formState = useMemo(() => {
    if (marketData) {
      return getRepayFormState(marketData, repayWeiValue, isWellConnected, balanceAllowanceData!, repayAsset)
    }

    return { canProcess: false, cantProcessReasons: [], haveToApprove: false }
  }, [marketData, repayWeiValue, isWellConnected, currentAddress, balanceAllowanceData, repayAsset])

  const marketValues = useMemo(() => {
    if (marketData) {
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
  }, [marketData, repayAssetInfo])

  const maxWithdrawable = useMemo(() => {
    if (marketData) {
      const collateralPriceRaw = marketData?.collateralInfos?.collateralUSDPrice

      const computedRepayWeiValue = !!repayAsset && repayAsset === "USG" ? repayWeiValue : usgRepayedValue

      const futureDebt = BigInt(marketData?.debtInfos?.userDebt || 0n) - (computedRepayWeiValue || 0n)

      const futureDeposited = BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n)
      const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
      const maxWithDrawable = collateralPriceRaw !== 0n ? futureDeposited - (futureDebt * BigInt(10 ** 18)) / ((collateralPriceRaw * maxLTV) / 100n) : 0n

      return maxWithDrawable > 0n ? maxWithDrawable : 0n
    }

    return 0n
  }, [marketData, repayWeiValue, usgRepayedValue])

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
    const assetInfo: AssetDataPriced = {
      address: TGUSD_CONTRACT.USG,
      decimals: 18,
      displayDecimals: 2,
      logo: "USG",
      name: "USG",
      price: 1,
      symbol: "USG",
    }

    setRepayWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !currentAddress || !marketData || !repayAssetInfo) return

      setIsZapLoading(true)
      try {
        const { quote } = await getQuote(value, currentAddress, assetInfo?.address, repayAssetInfo?.address)

        if (quote) {
          setUsgRepayedValue(quote)
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
    const address = repayAssetInfo?.address || TGUSD_CONTRACT.USG
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
    return `(~${formatDollar((Number(Number(formatUnits(usgRepayedValue || 0n, 18))) * tgUSDInfo?.price).toFixed(2))})`
  }, [usgRepayedValue, tgUSDInfo])

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
    marketData,
    slippage,
    setSlippage,
    tgUsdDollarRepayedValue,
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
