"use client"

import { toast } from "react-toastify"
import { useUSGContext } from "../../usg_context"
import { USGMarket, ZapToken } from "../../usg_type"
import { useUSGRecordContext } from "../usg_record_context"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { getQuote, getRoute } from "../../global_quote_controller"
import { AssetDataPriced, CollateralInfo, FormState } from "@/types"
import { useRootContext } from "@/components/products/root/root_context"
import { formatBigInt, formatBigIntAsNumber, formatDollar } from "@/lib/number_formatter"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { computeAprVariation, computedMinAmountOut, computeMaxBorrowable, computeSwapAssetPrice, doApprove } from "../usg_record_controller"
import { doZapDeposit, doZapDepositAndBorrow, getDepositFormState, doMarketDeposit, doMarketDepositAndBorrow } from "./usg_record_deposit_controller"
import { formatUnits, parseEther, zeroAddress } from "viem"

type USGDepositContextProps = {
  children: ReactNode
  isDepositAndBorrowInput: boolean
}

type USGDepositContextValues = {
  marketInfo: USGMarket
  collateralInfo: CollateralInfo
  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void
  actionDeposit: () => void
  actionApprove: () => void
  formState: FormState
  borrowWeiValue?: bigint
  setBorrowWeiValue: (arg: bigint | undefined) => void
  setDepositAsset: (arg: string) => void
  depositAsset: string | undefined
  tokens: ZapToken[]
  isDepositLoading: boolean
  setIsDepositLoading: (arg: boolean) => void
  isZapLoading: boolean
  setIsZapLoading: (arg: boolean) => void
  swapAssetPrice: number | null
  getRouteAndDeposit: () => void
  actionApproveZap: () => void
  zapValue: bigint | null
  setZapValue: (arg: bigint) => void
  handleDepositChange: (arg: bigint | undefined) => void
  handleZapChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  depositAssetInfo: AssetDataPriced | CollateralInfo

  slippage: number
  setSlippage: (arg: number) => void

  zapInnerValue: number | undefined
  setZapInnerValue: (arg: number | undefined) => void

  isZapUserInput: boolean
  setIsZapUserInput: (arg: boolean) => void

  depositSliderPercent: number
  setDepositSliderPercent: (arg: number) => void

  borrowSliderPercent: number
  setBorrowSliderPercent: (arg: number) => void

  handleZapInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  maxBorrowableValue: bigint

  estimatedZapDollarValue: string

  maxDepositString: string

  expectedCollateral: string

  aprVariation: { current: string; currentUpdated: string; projected: string; projectedUpdated: string }

  isZapping: boolean
}

export const USGDepositContext = createContext<USGDepositContextValues | undefined>(undefined)

export const USGDepositProvider = ({ children, isDepositAndBorrowInput }: USGDepositContextProps) => {
  const { curveRoutes, handleQuote } = useRootContext()

  const { tokens, loadUSGsUSGMetrics, marketAprs } = useUSGContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const {
    marketData,
    loadOnChainData,
    setCurrentAmounts,
    balanceAllowanceData,
    isDepositAndBorrow,
    fetchBalanceAllowanceData,
    collateralInfo,
    marketInfo,
    currentConvexTVL,
    setIsDepositAndBorrow,
  } = useUSGRecordContext()

  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()

  const [depositAsset, setDepositAsset] = useState<string | undefined>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

  const [borrowSliderPercent, setBorrowSliderPercent] = useState<number>(0)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [isDepositLoading, setIsDepositLoading] = useState(false)

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [zapValue, setZapValue] = useState<bigint | null>(null)

  const [zapInnerValue, setZapInnerValue] = useState<number | undefined>(zapValue !== undefined ? Number(formatUnits(zapValue || BigInt(0), 18)) : undefined)

  const [isZapUserInput, setIsZapUserInput] = useState<boolean>(false)

  const [slippage, setSlippage] = useState<number>(0.2)

  useEffect(() => {
    setIsDepositAndBorrow(isDepositAndBorrowInput)
  }, [])

  const depositAssetInfo = useMemo<AssetDataPriced | CollateralInfo>(() => {
    if (!!marketData && depositAsset === `Gauge ${collateralInfo?.symbol}`) {
      return {
        address: marketData?.constants?.receipt,
        decimals: 18,
        displayDecimals: 5,
        symbol: `Gauge ${collateralInfo?.symbol}`,
        name: `Gauge ${collateralInfo?.symbol}`,
        price: Number(formatUnits(marketData?.collateralInfos.collateralUSDPrice, 18)),
      }
    }

    if (depositAsset === "ETH") {
      return {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        displayDecimals: 5,
        symbol: "ETH",
        name: "ETH",
        price: swapAssetPrice,
      }
    }

    if (!!marketData && (depositAsset === undefined || depositAsset === collateralInfo?.name)) {
      return { ...collateralInfo, price: Number(formatUnits(marketData?.collateralInfos.collateralUSDPrice, 18)) }
    }

    const assetInfo = tokens.find((el: ZapToken) => el.name === depositAsset || el.symbol === depositAsset) || undefined

    if (!swapAssetPrice || !assetInfo) return collateralInfo

    const asset: AssetDataPriced = {
      address: assetInfo?.address,
      decimals: assetInfo?.decimals,
      displayDecimals: 2,
      symbol: assetInfo?.symbol,
      name: assetInfo?.name,
      price: swapAssetPrice,
    }

    return asset
  }, [depositAsset, swapAssetPrice, marketData])

  const isZapping = useMemo(() => {
    return !!depositAsset && depositAsset !== collateralInfo?.symbol && depositAsset !== `Gauge ${collateralInfo?.symbol}`
  }, [depositAsset, collateralInfo])

  const resetAfterDepositSuccess = () => {
    loadOnChainData()
    setDepositWeiValue(0n)
    setBorrowWeiValue(0n)
    setZapValue(null)
    setIsZapLoading(false)
    setBorrowSliderPercent(0)
    setDepositSliderPercent(0)
    setIsDepositLoading(false)
    loadUSGsUSGMetrics()
    fetchBalanceAllowanceData(depositAssetInfo?.address)
  }

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !depositAssetInfo) return

      setIsZapLoading(true)
      try {
        const { quote } = await getQuote(value, currentAddress || zeroAddress, marketInfo?.collatAddress, depositAssetInfo?.address, curveRoutes)

        handleQuote(quote)

        if (quote) {
          setZapValue(quote)
        }
      } catch (error) {
        console.error("Error fetching zap value:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    if (!!depositAssetInfo && isZapping) {
      fetchZapValue()
    } else if (!value || value == 0n) {
      setZapValue(0n)
    }
  }

  const handleZapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZapValue(parseEther(e?.target?.value))

    if (e?.target?.value === "") {
      setDepositWeiValue(undefined)
      return
    }

    const debounceTimeout = setTimeout(async () => {
      if (!parseEther(e?.target?.value) || !currentAddress || !depositAssetInfo) return
      setIsDepositLoading(true)

      try {
        const { quote } = await getQuote(parseEther(e?.target?.value), currentAddress, depositAssetInfo?.address, marketInfo?.collatAddress, curveRoutes)

        handleQuote(quote)

        if (quote) {
          setDepositWeiValue(BigInt(quote))
        }
      } catch (error) {
        console.error("Error fetching depositWeiValue:", error)
      } finally {
        setIsDepositLoading(false)
      }
    }, 500)

    return () => clearTimeout(debounceTimeout)
  }

  const handleZapInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    setZapInnerValue(value)
    setIsZapUserInput(true)
  }

  useEffect(() => {
    if (zapValue !== undefined) {
      const updatedValue = Number(Number(formatUnits(zapValue || 0n, 18)).toFixed(3))
      setZapInnerValue(updatedValue)
      setIsZapUserInput(false)
    } else {
      setZapInnerValue(undefined)
    }
  }, [zapValue])

  useEffect(() => {
    if (zapInnerValue === undefined) {
      setDepositWeiValue(undefined)
      setZapValue(0n)
      return
    }

    if (!isZapUserInput) return

    const handler = setTimeout(() => {
      handleZapChange({ target: { value: zapInnerValue.toString() } } as React.ChangeEvent<HTMLInputElement>)
    }, 500)

    return () => clearTimeout(handler)
  }, [zapInnerValue, isZapUserInput])

  useEffect(() => {
    if (!depositAsset) return

    const fetchSwapAssetData = async () => {
      setIsZapLoading(true)
      try {
        const data = await computeSwapAssetPrice(tokens, depositAsset)

        setSwapAssetPrice(data || 0)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    fetchSwapAssetData()
  }, [depositAsset])

  useEffect(() => {
    if (depositWeiValue && depositAsset !== collateralInfo?.symbol && zapValue) {
      setCurrentAmounts({
        depositWeiValue: depositWeiValue,
        borrowWeiValue: borrowWeiValue || 0n,
        zapValue: zapValue,
      })
    } else if (depositWeiValue && depositAssetInfo?.symbol === collateralInfo?.symbol) {
      setCurrentAmounts({
        depositWeiValue: depositWeiValue || 0n,
        borrowWeiValue: borrowWeiValue || 0n,
        zapValue: 0n,
      })
    } else {
      setCurrentAmounts({
        depositWeiValue: 0n,
        borrowWeiValue: 0n,
        zapValue: 0n,
      })
    }
  }, [depositWeiValue, borrowWeiValue, zapValue])

  const actionApproveZap = async () => {
    setIsDepositLoading(true)

    try {
      const walletClient = getWalletClient()
      if (!walletClient || !depositAssetInfo) throw new Error("Wallet not available")

      await toastTx(doApprove(walletClient, depositAssetInfo.address, marketInfo.marketAddress, depositWeiValue ?? 0n), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation…" },
        success: () => {
          fetchBalanceAllowanceData(depositAssetInfo.address)
          return { type: "Success", content: `${depositAssetInfo?.symbol} approved successfully.` }
        },
        error: () => ({ type: "Error", content: "Error" }),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsDepositLoading(false)
    }
  }

  const actionApprove = async () => {
    setIsDepositLoading(true)
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue) {
      await toastTx(doApprove(walletClient, depositAssetInfo?.address, marketInfo?.marketAddress, depositWeiValue), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation…" },
        success: () => {
          fetchBalanceAllowanceData(depositAssetInfo?.address)
          loadOnChainData()
          setIsDepositLoading(false)
          return { type: "Success", content: `${depositAssetInfo?.symbol} approved successfully.` }
        },
        error: () => ({ type: "Error", content: "Error" }),
      })
    }
  }

  const actionDeposit = () => {
    if (!depositWeiValue || !currentAddress || !depositAssetInfo) return

    if (isDepositAndBorrow) {
      depositAndBorrow()
    } else {
      deposit()
    }
  }

  const depositAndBorrow = async () => {
    setIsDepositLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && depositWeiValue) {
      const isReceiptIn = marketData?.constants?.receipt.toLowerCase() === depositAssetInfo?.address.toLowerCase()

      await toastTx(
        doMarketDepositAndBorrow(walletClient, { depositWeiValue, isDepositAndBorrow, marketAddress: marketInfo?.marketAddress, borrowWeiValue, isReceiptIn }),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => {
            resetAfterDepositSuccess()
            return { type: "Success", content: "Position successfully created." }
          },
          error: () => {
            setIsDepositLoading(false)
            return { type: "Error", content: "Unable to proceed with the transaction." }
          },
        }
      )
    } else {
      setIsDepositLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Unable to proceed with the transaction." } })
    }
  }

  const deposit = async () => {
    setIsDepositLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && depositWeiValue) {
      const isReceiptIn = marketData?.constants?.receipt.toLowerCase() === depositAssetInfo?.address.toLowerCase()

      await toastTx(doMarketDeposit(walletClient, { depositWeiValue, marketAddress: marketInfo?.marketAddress, borrowWeiValue, isReceiptIn }), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => {
          resetAfterDepositSuccess()
          return { type: "Success", content: "Position successfully created." }
        },
        error: () => {
          setIsDepositLoading(false)
          return { type: "Error", content: "Unable to proceed with the transaction." }
        },
      })
    } else {
      setIsDepositLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Unable to proceed with the transaction." } })
    }
  }

  useEffect(() => {
    if (depositAssetInfo) {
      fetchBalanceAllowanceData(depositAssetInfo?.address)
    }
  }, [depositAssetInfo])

  useEffect(() => {
    if (depositAsset) {
      setBorrowWeiValue(0n)
      setBorrowSliderPercent(0)
      setDepositWeiValue(0n)
      setZapValue(0n)
    }
  }, [depositAsset])

  useEffect(() => {
    if (!isDepositAndBorrow) {
      setBorrowWeiValue(0n)
      setBorrowSliderPercent(0)
    }
  }, [isDepositAndBorrow])

  const getRouteAndDeposit = async () => {
    if (!depositWeiValue || !currentAddress || !depositAssetInfo) return

    if (isDepositAndBorrow) {
      zapAndDepositAndBorrow()
    } else {
      zapAndDeposit()
    }
  }

  const zapAndDepositAndBorrow = async () => {
    if (!depositWeiValue || !currentAddress || !depositAssetInfo || !borrowWeiValue || !zapValue) return

    setIsZapLoading(true)
    setIsDepositLoading(true)

    try {
      const zapData = await getRoute(
        depositAssetInfo?.address,
        collateralInfo?.address,
        depositWeiValue,
        computedMinAmountOut(zapValue, slippage),
        marketInfo?.marketAddress,
        currentAddress,
        curveRoutes
      )

      const zapMarketData = {
        tokenIn: depositAssetInfo?.address,
        amountIn: depositWeiValue,
        minAmountOut: computedMinAmountOut(zapValue, slippage),
      }

      const walletClient = getWalletClient()

      await toastTx(
        doZapDepositAndBorrow(marketInfo?.marketAddress, walletClient!, zapData?.routerAddress, zapData?.data as string, zapMarketData, borrowWeiValue),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => {
            resetAfterDepositSuccess()
            return { type: "Success", content: "Position successfully created." }
          },
          error: () => {
            setIsDepositLoading(false)
            setIsZapLoading(false)

            return { type: "Error", content: "Unable to proceed with the transaction." }
          },
        }
      )
    } catch (error) {
      console.error("Error in getRouteAndDeposit:", error)
    }
  }

  const zapAndDeposit = async () => {
    if (!depositWeiValue || !currentAddress || !depositAssetInfo || !zapValue) return

    setIsZapLoading(true)
    setIsDepositLoading(true)

    try {
      const zapData = await getRoute(
        depositAssetInfo?.address,
        collateralInfo?.address,
        depositWeiValue,
        computedMinAmountOut(zapValue, slippage),
        marketInfo?.marketAddress,
        currentAddress,
        curveRoutes
      )

      const zapMarketData = {
        tokenIn: depositAssetInfo?.address,
        amountIn: depositWeiValue,
        minAmountOut: computedMinAmountOut(zapValue, slippage),
      }

      const walletClient = getWalletClient()

      await toastTx(doZapDeposit(marketInfo?.marketAddress, walletClient!, zapData?.routerAddress, zapData?.data as string, zapMarketData), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => {
          resetAfterDepositSuccess()
          return { type: "Success", content: "Position successfully created." }
        },
        error: () => {
          setIsDepositLoading(false)
          setIsZapLoading(false)

          return { type: "Error", content: "Unable to proceed with the transaction." }
        },
      })
    } catch (error) {
      console.error("Error in zapAndDeposit:", error)
      setIsZapLoading(false)
      setIsDepositLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Transation failed." } })
    }
  }

  const maxBorrowableValue = useMemo(() => {
    const deposit = depositWeiValue || 0n

    if (marketData) {
      const futureDebt = marketData?.debtInfos?.userDebt
      let futureDeposited

      if (isZapping && zapValue) {
        futureDeposited =
          marketData?.collateralInfos?.positionCollateralUSDValue +
          (computedMinAmountOut(zapValue, slippage) * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** 18)
      } else {
        futureDeposited =
          marketData?.collateralInfos?.positionCollateralUSDValue + (deposit * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** 18)
      }
      const maxBorrowable = (futureDeposited * marketData?.constants.maxLTV) / 100000n - futureDebt

      const computedMaxBorrowable = computeMaxBorrowable(maxBorrowable, marketData?.constants?.maxMarketDebt, marketData?.debtInfos?.totalDebt)

      return computedMaxBorrowable
    }

    return 0n
  }, [marketData, depositWeiValue, depositAsset, depositAssetInfo, zapValue, slippage, isZapping])

  // TODO Verify for a market that doesn't have a 18 decimals collateral
  const estimatedZapDollarValue = useMemo(() => {
    if (zapValue && marketData) {
      const result = `~(${formatDollar(
        formatUnits((computedMinAmountOut(zapValue, slippage) * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** 18), 18)
      )})`
      return result
    }

    return ""
  }, [zapValue, slippage])

  const maxDepositString = useMemo(() => {
    const asset = depositAssetInfo?.symbol

    let amountDisplayed = "0"

    if (!!balanceAllowanceData && currentAddress && (isZapping || depositAssetInfo?.address == marketData?.constants?.receipt)) {
      amountDisplayed = formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)
    }
    if (currentAddress && !isZapping) {
      amountDisplayed = formatBigInt(marketData?.collateralBalance, depositAssetInfo?.decimals, 2)
    }
    return `Max ${amountDisplayed} ${asset}`
  }, [currentAddress, depositAssetInfo, balanceAllowanceData, isZapping])

  const expectedCollateral = useMemo(() => {
    if (marketData) {
      if (zapValue && isZapping) {
        return `${formatBigIntAsNumber(BigInt(zapValue || 0n), 18, 3)}  ${collateralInfo?.symbol}`
      } else if (depositAssetInfo?.address === collateralInfo?.address && depositWeiValue) {
        return `${formatBigIntAsNumber(depositWeiValue || 0n, 18, 3)}  ${collateralInfo?.symbol}`
      }
    }
    return `0 ${collateralInfo?.symbol}`
  }, [zapValue, depositWeiValue, collateralInfo?.symbol, marketData, isZapping])

  const aprVariation = useMemo(() => {
    let result = { current: "", currentUpdated: "-", projected: "", projectedUpdated: "-" }

    if (marketAprs && marketData && currentConvexTVL) {
      if (zapValue && isZapping) {
        result = computeAprVariation(marketAprs, currentConvexTVL, marketData, BigInt(zapValue))
      } else if (!isZapping && depositWeiValue) {
        result = computeAprVariation(marketAprs, currentConvexTVL, marketData, depositWeiValue)
      } else {
        result = computeAprVariation(marketAprs, currentConvexTVL, marketData, 0n)
      }
    }
    return result
  }, [zapValue, depositWeiValue, collateralInfo?.symbol, marketAprs, marketData, currentConvexTVL, isZapping])

  const formState = useMemo(
    () =>
      getDepositFormState(
        marketData,
        depositWeiValue,
        borrowWeiValue,
        isDepositAndBorrow,
        isWellConnected,
        depositAssetInfo?.address,
        collateralInfo!,
        balanceAllowanceData!,
        maxBorrowableValue || 0n
      ),
    [marketData, isDepositAndBorrow, borrowWeiValue, depositWeiValue, isWellConnected, currentAddress, depositAssetInfo, balanceAllowanceData, isDepositLoading]
  )

  const contextValue: USGDepositContextValues = {
    marketInfo,
    collateralInfo,
    depositWeiValue,
    setDepositWeiValue,
    actionApprove,
    actionDeposit,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
    setDepositAsset,
    depositAsset,
    tokens,

    isDepositLoading,
    setIsDepositLoading,

    isZapLoading,
    setIsZapLoading,

    zapValue,
    setZapValue,

    handleDepositChange,
    handleZapChange,
    swapAssetPrice,
    getRouteAndDeposit,
    actionApproveZap,
    depositAssetInfo,

    slippage,
    setSlippage,

    zapInnerValue,
    setZapInnerValue,

    isZapUserInput,
    setIsZapUserInput,

    handleZapInputChange,

    depositSliderPercent,
    setDepositSliderPercent,

    borrowSliderPercent,
    setBorrowSliderPercent,

    maxBorrowableValue,

    estimatedZapDollarValue,

    maxDepositString,

    aprVariation,

    expectedCollateral,

    isZapping,
  }

  return <USGDepositContext.Provider value={contextValue}>{children}</USGDepositContext.Provider>
}

export const useUSGDepositContext = () => {
  const context = useContext(USGDepositContext)
  if (!context) {
    throw new Error("useUSGDepositContext must be used within a USGDepositProvider")
  }
  return context
}
