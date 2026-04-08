"use client"

import { toast } from "react-toastify"
import { AssetDataPriced } from "@/types"
import { FormState } from "../../usg_type"
import { useUSGContext } from "../../usg_context"
import { USG_CONTRACT } from "../../usg_repository"
import { Erc20Details, ERC20S } from "@/data/erc20s"
import { Address, formatUnits, maxUint256 } from "viem"
import { BuyAndMinOutFormatted } from "../leverage/types"
import { useUSGRecordContext } from "../usg_record_context"
import { getQuote, getRoute } from "../../global_quote_controller"
import { useRootContext } from "@/components/products/root/root_context"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { formatBigInt, formatDollar, toBigInt } from "@/lib/number_formatter"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doRepay, doRepayAndWithdraw, doZapRepay, doZapRepayAndWithdraw, getRepayFormState } from "./usg_record_repay_controller"
import { computedMinAmountOut, computeSwapAssetPrice, computeTransactionPotentialLoss, doApprove, matchBlockChainErrors } from "../usg_record_controller"

type USGRepayContextProps = {
  children: ReactNode
  isRepayAndWithdrawInput: boolean
}

type USGRepayContextValues = {
  actionRepay: () => void
  formState: FormState

  repayWeiValue?: bigint
  setRepayWeiValue: (arg: bigint | undefined) => void

  maxRepayableValue: bigint

  withdrawWeiValue?: bigint
  setWithdrawWeiValue: (arg: bigint | undefined) => void

  percentage: number
  setPercentage: (arg: number) => void

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

  USGDollarRepayedValue: string

  withdrawSelectedAsset: string | undefined
  setWithdrawSelectedAsset: (v: string) => void

  slippageLoss: { tokenLoss: string; dollarLoss: string }

  isTransactionBlockedBySlippage: boolean
  setIsTransactionBlockedBySlippage: (arg: boolean) => void

  priceImpactLoss: string

  priceImpact: number

  isTransactionBlockedByPriceImpact: boolean
  setIsTransactionBlockedByPriceImpact: (arg: boolean) => void

  zapValuesFormatted: BuyAndMinOutFormatted

  expectedUSGRefunded: string | undefined
}

export const USGRepayContext = createContext<USGRepayContextValues | undefined>(undefined)

export const USGRepayProvider = ({ children, isRepayAndWithdrawInput }: USGRepayContextProps) => {
  const WITHDRAW_BUFFER = BigInt(10 ** 16)

  const { curveRoutes, handleQuote } = useRootContext()

  const { loadUSGsUSGMetrics, USGsUSGMetrics } = useUSGContext()

  const { isWellConnected, walletClient, currentAddress } = useWalletConnexionContext()

  const {
    marketData,
    USGInfo,
    balanceAllowanceData,
    setIsRepayAndWithdraw,
    loadOnChainData,
    setCurrentAmounts,
    fetchBalanceAllowanceData,
    collateralInfo,
    isRepayAndWithdraw,
    setIsTxLoading,
    isTxLoading,
    futureMarketDisplayData,
  } = useUSGRecordContext()

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [repayWeiValue, setRepayWeiValue] = useState<bigint | undefined>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

  const [withdrawWeiValue, setWithdrawWeiValue] = useState<bigint | undefined>()

  const [repayAsset, setRepayAsset] = useState<string>("USG")

  const [percentage, setPercentage] = useState<number>(0)

  const [slippage, setSlippage] = useState<number>(0.2)

  const [isRepayMax, setIsRepayMax] = useState<boolean>(false)

  const [withdrawPercentage, setWithdrawPercentage] = useState<number>(0)

  const [usgRepayedValue, setUsgRepayedValue] = useState<bigint | undefined>()

  const [withdrawSelectedAsset, setWithdrawSelectedAsset] = useState<string>()

  const [isTransactionBlockedBySlippage, setIsTransactionBlockedBySlippage] = useState<boolean>(false)

  const [isTransactionBlockedByPriceImpact, setIsTransactionBlockedByPriceImpact] = useState<boolean>(false)

  const [priceImpact, setPriceImpact] = useState<number>(0)

  const latestRequestRef = useRef(0)

  const repayDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (collateralInfo) {
      setWithdrawSelectedAsset(collateralInfo.name)
    }
  }, [collateralInfo?.name])

  useEffect(() => {
    setIsRepayAndWithdraw(isRepayAndWithdrawInput)
  }, [])

  useEffect(() => {
    if (!isRepayAndWithdraw) {
      setWithdrawWeiValue(undefined)
      setWithdrawPercentage(0)
    }
  }, [isRepayAndWithdraw])

  const repayAssetInfo = useMemo<AssetDataPriced | null>(() => {
    const assetInfo = ERC20S.find((el: Erc20Details) => el.name === repayAsset || el.symbol === repayAsset) || undefined

    if (!swapAssetPrice || !assetInfo) return null

    const asset: AssetDataPriced = {
      address: assetInfo?.address,
      decimals: assetInfo?.decimals,
      displayDecimals: assetInfo?.displayDecimals || 2,
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
    if (!repayWeiValue || !repayAssetInfo || !marketData || !withdrawWeiValue) {
      toast.error(ToastComponent, { data: { type: "Error", content: "Error while computing repay data." } })
      return
    }

    setIsTxLoading(true)

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

      const isReceiptOut = withdrawSelectedAsset !== collateralInfo?.name

      await toastTx(doZapRepayAndWithdraw(marketData?.marketAddress, walletClient!, withdrawWeiValue, isReceiptOut, repayData!, zapMarketData), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({
          type: "Success",
          content: "Transaction successful",
        }),
        error: (err) => {
          const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
          return { type: "Error", content: error || "Unable to proceed with the transaction." }
        },
      })
        .then(() => {
          resetAfterRepaySuccess()
          setIsTxLoading(false)
        })
        .catch(() => {
          setIsTxLoading(false)
        })
    } catch (error) {
      console.error("Error in getRouteAndDeposit:", error)
      setIsTxLoading(false)
      const err = matchBlockChainErrors(typeof error === "string" ? error : error instanceof Error ? error.message : String(error))
      toast.error(ToastComponent, { data: { type: "Error", content: err || "Unable to proceed with the transaction." } })
    }
  }

  const zapRepay = async () => {
    if (!repayWeiValue || !repayAssetInfo || !marketData || !usgRepayedValue) {
      toast.error(ToastComponent, { data: { type: "Error", content: "Error while computing repay data." } })
      return
    }

    setIsTxLoading(true)

    try {
      const repayData = await getRoute(
        repayAssetInfo?.address,
        USG_CONTRACT?.USG,
        repayWeiValue,
        computedMinAmountOut(usgRepayedValue, slippage),
        currentAddress!,
        USG_CONTRACT.ZAPPER,
        curveRoutes
      )

      const zapMarketData = {
        tokenIn: repayAssetInfo?.address,
        amountIn: repayWeiValue,
        minAmountOut: computedMinAmountOut(usgRepayedValue, slippage),
      }

      await toastTx(doZapRepay(marketData?.marketAddress, walletClient!, repayData!, zapMarketData), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({
          type: "Success",
          content: "Transaction successful",
        }),
        error: (err) => {
          const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
          return { type: "Error", content: error || "Unable to proceed with the transaction." }
        },
      })
        .then(() => {
          resetAfterRepaySuccess()
          setIsTxLoading(false)
        })
        .catch(() => {
          setIsTxLoading(false)
        })
    } catch (error) {
      console.error("Error in getRouteAndDeposit:", error)
      setIsTxLoading(false)
      const err = matchBlockChainErrors(typeof error === "string" ? error : error instanceof Error ? error.message : String(error))
      toast.error(ToastComponent, { data: { type: "Error", content: err || "Unable to proceed with the transaction." } })
    }
  }

  const actionApprove = async () => {
    if (!repayWeiValue || !repayAssetInfo || !marketData) return

    setIsTxLoading(true)

    await toastTx(doApprove(walletClient!, repayAssetInfo?.address, marketData?.marketAddress, repayWeiValue), {
      pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
      success: () => ({
        type: "Success",
        content: `${repayAssetInfo?.symbol} approved successfully.`,
      }),
    })

    setIsTxLoading(false)
    loadOnChainData()
    fetchBalanceAllowanceData(repayAssetInfo?.address)
  }

  const actionRepay = () => {
    if (!!withdrawWeiValue && withdrawWeiValue > 0) {
      marketRepayAndWithdraw()
    } else {
      marketRepay()
    }
  }

  function repayValue(repayWeiValue: bigint | undefined) {
    let repayValue = repayWeiValue
    if (!repayValue) return

    if (isRepayMax || percentage === 100) {
      const usgBalance = marketData?.debtInfos.usgBalance || 0n

      if (usgBalance > repayValue) {
        repayValue = maxUint256
      }
    }

    return repayValue
  }

  const marketRepay = async () => {
    try {
      setIsTxLoading(true)

      await toastTx(
        doRepay(walletClient!, {
          marketAddress: marketData!.marketAddress,
          repayWeiValue: repayValue(repayWeiValue),
        }),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: "Transaction successful.",
          }),
          error: (err) => {
            const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
            return { type: "Error", content: error || "Unable to proceed with the transaction." }
          },
        }
      )

      resetAfterRepaySuccess()
    } catch {
      setIsTxLoading(false)
    }
  }

  const marketRepayAndWithdraw = async () => {
    try {
      setIsTxLoading(true)

      await toastTx(
        doRepayAndWithdraw(walletClient!, {
          marketAddress: marketData!.marketAddress,
          repayWeiValue: repayValue(repayWeiValue),
          withdrawWeiValue,
          isReceiptOut: withdrawSelectedAsset !== collateralInfo?.address,
        }),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: "Transaction successful.",
          }),
          error: (err) => {
            const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
            return { type: "Error", content: error || "Unable to proceed with the transaction." }
          },
        }
      )

      resetAfterRepaySuccess()
    } catch {
      setIsTxLoading(false)
    }
  }

  const resetAfterRepaySuccess = () => {
    loadOnChainData()
    setPercentage(0)
    setWithdrawPercentage(0)
    setIsTxLoading(false)
    setRepayWeiValue(undefined)
    setWithdrawWeiValue(undefined)
    setUsgRepayedValue(undefined)
    loadUSGsUSGMetrics()
  }

  const transactionExceedsMaxLtv = useMemo(() => {
    const computedLtv = futureMarketDisplayData.ltv.substring(0, futureMarketDisplayData.ltv.length - 1)

    const ltvAsNumber = Number(computedLtv)

    return !!futureMarketDisplayData && ltvAsNumber > Number(marketData?.constants?.maxLTV) / 1000
  }, [futureMarketDisplayData, marketData])

  const formState = useMemo(() => {
    return getRepayFormState(
      isTransactionBlockedByPriceImpact,
      isTransactionBlockedBySlippage,
      marketData,
      repayWeiValue,
      isWellConnected,
      balanceAllowanceData!,
      repayAsset,
      isZapLoading || isTxLoading,
      transactionExceedsMaxLtv
    )
  }, [
    isTransactionBlockedByPriceImpact,
    isTransactionBlockedBySlippage,
    marketData,
    repayWeiValue,
    isWellConnected,
    currentAddress,
    balanceAllowanceData,
    repayAsset,
    isZapLoading || isTxLoading,
    transactionExceedsMaxLtv,
  ])

  const marketValues = useMemo(() => {
    if (marketData && currentAddress) {
      const userDebt = marketData.debtInfos?.userDebt

      if (repayAsset === "USG") {
        const usgBalance = marketData.debtInfos.usgBalance

        const maxRepayableValue = usgBalance < userDebt ? usgBalance : userDebt

        const minimumLoan = marketData.constants.minimumLoan || 0n
        return { maxRepayableValue, minimumLoan }
      } else if (marketData && repayAssetInfo) {
        const maxRepayableInZapAsset = (userDebt / toBigInt(repayAssetInfo?.price, 18)) * BigInt(10 ** (repayAssetInfo?.decimals || 18))
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

      if (futureDebt === 0n) {
        return maxWithDrawable > 0n ? maxWithDrawable : 0n
      }

      return maxWithDrawable > WITHDRAW_BUFFER ? (maxWithDrawable * 9995n) / 10000n : 0n
    }

    return 0n
  }, [marketData, repayWeiValue, usgRepayedValue, currentAddress])

  function handleRepayValueChange(value: bigint | undefined) {
    setRepayWeiValue(value)
    setPriceImpact(0)

    if (!value || !currentAddress || !marketData || !repayAssetInfo || repayAssetInfo?.symbol === "USG") {
      if (!value || value === 0n) setUsgRepayedValue(undefined)
      return
    }

    setIsZapLoading(true)

    if (repayDebounceRef.current) clearTimeout(repayDebounceRef.current)

    repayDebounceRef.current = setTimeout(() => {
      quoteRepayZap(value)
    }, 1200)
  }

  async function quoteRepayZap(value: bigint) {
    const requestId = ++latestRequestRef.current

    getQuote(value, currentAddress!, USG_CONTRACT.USG, repayAssetInfo?.address as Address, curveRoutes)
      .then(({ quote, priceImpact: pI }) => {
        if (requestId !== latestRequestRef.current) return

        const { validQuote, validPriceImpact } = handleQuote(quote, pI)

        if (validPriceImpact >= 0 && validQuote) {
          setUsgRepayedValue(validQuote)
          setPriceImpact(Number(validPriceImpact) / 100)
        } else {
          setUsgRepayedValue(undefined)
        }
      })
      .catch((error) => {
        if (requestId !== latestRequestRef.current) return
        console.error("Error fetching repay zap value:", error)
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) setIsZapLoading(false)
      })
  }

  useEffect(() => {
    const address = repayAssetInfo?.address || USG_CONTRACT.USG
    if (walletClient) {
      fetchBalanceAllowanceData(address)
    }
  }, [repayAssetInfo?.address, walletClient])

  useEffect(() => {
    setPercentage(0)
    setWithdrawPercentage(0)
    setRepayWeiValue(undefined)
    setWithdrawWeiValue(undefined)
    setUsgRepayedValue(undefined)

    if (!repayAsset) return

    const fetchSwapAssetData = async () => {
      setIsZapLoading(true)
      try {
        const data = await computeSwapAssetPrice(repayAsset, USGsUSGMetrics!.sUSGPrice, USGsUSGMetrics!.sUSGPrice)
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

  const USGDollarRepayedValue = useMemo(() => {
    return `(${formatDollar((Number(Number(formatUnits(usgRepayedValue || 0n, 18))) * USGInfo?.price).toFixed(2))})`
  }, [usgRepayedValue, USGInfo])

  const zapValuesFormatted = useMemo(() => {
    if (!isZapLoading && usgRepayedValue) {
      const minAmountOutWei = computedMinAmountOut(usgRepayedValue, slippage)
      const decimals = collateralInfo?.decimals || 18
      const displayDecimals = collateralInfo?.displayDecimals || 2

      return {
        expectedFormatted: `${formatBigInt(usgRepayedValue, decimals, displayDecimals)} `,
        minOutFormatted: `${formatBigInt(minAmountOutWei, decimals, displayDecimals)}`,
      }
    }

    return { expectedFormatted: `-`, minOutFormatted: `-` }
  }, [usgRepayedValue, slippage, isZapLoading, collateralInfo])

  const priceImpactLoss = useMemo(() => {
    const { dollarLoss } = computeTransactionPotentialLoss(usgRepayedValue as bigint, USGInfo, priceImpact)

    return dollarLoss
  }, [usgRepayedValue, priceImpact, USGInfo])

  const slippageLoss = useMemo(() => {
    const { tokenLoss, dollarLoss } = computeTransactionPotentialLoss(usgRepayedValue as bigint, USGInfo, slippage)

    return { tokenLoss, dollarLoss }
  }, [slippage, usgRepayedValue, USGInfo])

  useEffect(() => {
    setIsTransactionBlockedBySlippage(!!repayWeiValue && !!usgRepayedValue && slippage >= 1)
  }, [slippage, usgRepayedValue, repayWeiValue])

  useEffect(() => {
    setIsTransactionBlockedByPriceImpact(!!repayWeiValue && !!usgRepayedValue && priceImpact >= 0.25)
  }, [priceImpact, usgRepayedValue, repayWeiValue])

  const expectedUSGRefunded = useMemo(() => {
    if (usgRepayedValue && marketData?.debtInfos?.userDebt && usgRepayedValue > marketData?.debtInfos?.userDebt) {
      const minAmountOutWei = computedMinAmountOut(usgRepayedValue, slippage)

      return minAmountOutWei - marketData?.debtInfos?.userDebt >= 0n ? formatBigInt(minAmountOutWei - marketData?.debtInfos?.userDebt, 18, 2) : undefined
    }

    return undefined
  }, [marketData, usgRepayedValue, slippage])

  const contextValue: USGRepayContextValues = {
    actionRepay,
    formState,
    repayWeiValue,
    setRepayWeiValue,
    maxRepayableValue: marketValues?.maxRepayableValue,
    percentage,
    setPercentage,
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
    actionZapRepay,
    isRepayMax,
    setIsRepayMax,
    isDebtBelowThreshold,
    slippage,
    setSlippage,
    USGDollarRepayedValue,
    withdrawSelectedAsset,
    setWithdrawSelectedAsset,

    slippageLoss,

    isTransactionBlockedBySlippage,
    setIsTransactionBlockedBySlippage,

    priceImpactLoss,

    priceImpact,

    isTransactionBlockedByPriceImpact,
    setIsTransactionBlockedByPriceImpact,

    zapValuesFormatted,

    expectedUSGRefunded,
  }

  return <USGRepayContext.Provider value={contextValue}>{children}</USGRepayContext.Provider>
}

export const useUSGRepayContext = () => {
  const context = useContext(USGRepayContext)
  if (!context) {
    throw new Error("useUSGRepayContext must be used within a USGRepayProvider")
  }
  return context
}
