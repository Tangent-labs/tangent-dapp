"use client"

import { toast } from "react-toastify"
import { ZapToken } from "../../usg_type"
import { formatUnits, parseEther } from "viem"
import { useUSGContext } from "../../usg_context"
import { USG_CONTRACT } from "../../usg_repository"
import { useUSGRecordContext } from "../usg_record_context"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { getQuote, getRoute } from "../../global_quote_controller"
import { AssetDataPriced, CollateralInfo, FormState } from "@/types"
import { useRootContext } from "@/components/products/root/root_context"
import { formatBigInt, formatBigIntAsNumber, formatDollar } from "@/lib/number_formatter"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { doMarketLeverage, doZapLeverage, getLeverageFormState } from "./usg_record_leverage_controller"
import { computeAprVariation, computedMinAmountOut, computeSwapAssetPrice, doApprove } from "../usg_record_controller"

type USGLeverageContextProps = {
  children: ReactNode
}

type USGLeverageContextValues = {
  collateralInfo: AssetDataPriced

  isDepositDisabled: boolean
  setIsDepositDisabled: (arg: boolean) => void

  isLeverageAllPosition: boolean
  setIsLeverageAllPosition: (arg: boolean) => void

  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void
  actionApprove: () => void
  actionApproveZap: () => void
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

  zapValue: bigint | null
  setZapValue: (arg: bigint) => void
  handleDepositChange: (arg: bigint | undefined) => void
  depositAssetInfo: AssetDataPriced | CollateralInfo

  slippage: number
  setSlippage: (arg: number) => void

  zapInnerValue: number | undefined
  setZapInnerValue: (arg: number | undefined) => void

  depositSliderPercent: number
  setDepositSliderPercent: (arg: number) => void

  leveragePercentage: number
  setLeveragePercentage: (arg: number) => void

  handleZapInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  actionLeverage: () => void

  actionZapLeverage: () => void

  leveragedCollateralQuote: bigint | undefined
  setLeveragedCollateralQuote: (arg: bigint) => void

  expectedCollateral: { sum: string; result: string }

  estimatedZapDollarValue: string

  updateBorrowWeiValue: (value: bigint) => Promise<void>

  maxDepositString: string

  computedMaxLeverage: string

  aprVariation: { current: string; currentUpdated: string; projected: string; projectedUpdated: string }

  computedDepositAmount: bigint

  isZapping: boolean
}

export const USGLeverageContext = createContext<USGLeverageContextValues | undefined>(undefined)

export const USGLeverageProvider = ({ children }: USGLeverageContextProps) => {
  const {
    marketData,
    marketInfo,
    balanceAllowanceData,
    futureMarketDisplayData,
    collateralInfo,
    currentConvexTVL,
    fetchBalanceAllowanceData,
    loadOnChainData,
    setCurrentAmounts,
  } = useUSGRecordContext()

  const { curveRoutes, handleQuote } = useRootContext()

  const { tokens, loadUSGsUSGMetrics, marketAprs } = useUSGContext()

  const { isWellConnected, walletClient, currentAddress } = useWalletConnexionContext()

  const [isDepositDisabled, setIsDepositDisabled] = useState<boolean>(false)

  const [isLeverageAllPosition, setIsLeverageAllPosition] = useState<boolean>(false)

  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()

  const [depositAsset, setDepositAsset] = useState<string | undefined>(undefined)

  const [isZapUserInput, setIsZapUserInput] = useState<boolean>(false)

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

  const [leveragePercentage, setLeveragePercentage] = useState<number>(1)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [isDepositLoading, setIsDepositLoading] = useState(false)

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [zapValue, setZapValue] = useState<bigint | null>(null)

  const [zapInnerValue, setZapInnerValue] = useState<number | undefined>(zapValue !== undefined ? Number(formatUnits(zapValue || BigInt(0), 18)) : undefined)

  const [leveragedCollateralQuote, setLeveragedCollateralQuote] = useState<bigint | undefined>()

  const [slippage, setSlippage] = useState<number>(0.2)

  const isZapping = useMemo(() => {
    return !!depositAsset && depositAsset !== collateralInfo?.symbol && depositAsset !== `Gauge ${collateralInfo?.symbol}`
  }, [depositAsset, collateralInfo])

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

  const handleDepositChange = useCallback(
    (value: bigint | undefined) => {
      setDepositWeiValue(value)
      if (!value || !currentAddress || !depositAssetInfo) return
      if (depositAssetInfo.address === marketInfo?.collatAddress) return

      setIsZapLoading(true)

      getQuote(value, currentAddress, marketInfo?.collatAddress, depositAssetInfo?.address, curveRoutes)
        .then(({ quote }) => {
          if (quote) setZapValue(quote as bigint)
        })
        .catch((e) => console.error("Error fetching zap value:", e))
        .finally(() => setIsZapLoading(false))
    },
    [currentAddress, depositAssetInfo?.address, marketInfo?.collatAddress]
  )

  const handleZapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value
    setZapValue(parseEther(value))

    if (value === "") {
      setDepositWeiValue(undefined)
      return
    }

    ;(async () => {
      if (!currentAddress || !depositAssetInfo) return
      setIsDepositLoading(true)
      try {
        const { quote } = await getQuote(parseEther(e?.target?.value), currentAddress, depositAssetInfo?.address, marketInfo?.collatAddress, curveRoutes)

        handleQuote(quote)

        if (quote) {
          setDepositWeiValue(quote)
        }
      } catch (err) {
        console.error("Error fetching depositWeiValue:", err)
      } finally {
        setIsDepositLoading(false)
      }
    })()
  }

  const handleZapInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    setIsZapUserInput(true)
    setZapInnerValue(value)
  }

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
    setBorrowWeiValue(0n)
    setDepositWeiValue(0n)
    setDepositSliderPercent(0)
    setLeveragePercentage(0)
    setLeveragedCollateralQuote(0n)
    setZapValue(0n)
  }, [depositAsset])

  useEffect(() => {
    if (zapValue && borrowWeiValue && leveragedCollateralQuote && !isDepositLoading) {
      setCurrentAmounts({
        depositWeiValue: (depositWeiValue || 0n) + leveragedCollateralQuote,
        borrowWeiValue: borrowWeiValue || 0n,
        zapValue: (BigInt(zapValue) || 0n) + leveragedCollateralQuote,
      })
    } else if (borrowWeiValue && leveragedCollateralQuote && !isDepositLoading) {
      setCurrentAmounts({
        depositWeiValue: (depositWeiValue || 0n) + leveragedCollateralQuote,
        borrowWeiValue: borrowWeiValue || 0n,
        zapValue: 0n,
      })
    }
  }, [depositWeiValue, borrowWeiValue, zapValue, leveragedCollateralQuote, isDepositLoading])

  useEffect(() => {
    setCurrentAmounts({
      depositWeiValue: 0n,
      borrowWeiValue: 0n,
      zapValue: 0n,
    })
  }, [])

  const actionApproveZap = async () => {
    setIsDepositLoading(true)
    if (walletClient && depositWeiValue) {
      await toastTx(doApprove(walletClient, depositAssetInfo?.address, marketInfo?.marketAddress, depositWeiValue), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
        success: () => {
          fetchBalanceAllowanceData(depositAssetInfo?.address)
          setIsDepositLoading(false)
          return { type: "Success", content: `${depositAssetInfo?.symbol} approved successfully.` }
        },
      })
    }
  }

  const actionApprove = async () => {
    setIsDepositLoading(true)
    if (walletClient && depositWeiValue)
      await toastTx(doApprove(walletClient, marketInfo?.collatAddress, marketInfo?.marketAddress, depositWeiValue), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
        success: () => {
          loadOnChainData()
          return { type: "Success", content: `${depositAssetInfo?.symbol} approved successfully.` }
        },
      })
  }

  const actionZapLeverage = async () => {
    try {
      if (!walletClient || !currentAddress || !depositWeiValue || !borrowWeiValue || !depositAssetInfo || !leveragedCollateralQuote || !zapValue) {
        toast.error(ToastComponent, { data: { type: "Error", content: "Error while computing leverage data." } })
        return
      }

      setIsDepositLoading(true)

      const leverageData = await getRoute(
        USG_CONTRACT.USG,
        marketInfo?.collatAddress,
        borrowWeiValue,
        computedMinAmountOut(leveragedCollateralQuote, slippage),
        marketInfo?.marketAddress,
        USG_CONTRACT.ZAPPER,
        curveRoutes
      )

      const zapData = await getRoute(
        depositAssetInfo?.address,
        marketInfo?.collatAddress,
        depositWeiValue,
        computedMinAmountOut(zapValue, slippage),
        marketInfo?.marketAddress,
        currentAddress!,
        curveRoutes,
        currentAddress!
      )

      await toastTx(
        doZapLeverage(
          borrowWeiValue,
          computedMinAmountOut(leveragedCollateralQuote, slippage),
          leverageData!,
          depositAssetInfo?.address,
          depositWeiValue,
          computedMinAmountOut(zapValue, slippage),
          zapData!,
          walletClient,
          marketInfo?.marketAddress
        ),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => {
            resetAfterLeverageSuccess()
            setIsDepositLoading(false)
            return { type: "Success", content: "Position successfully created." }
          },
          error: () => {
            setIsDepositLoading(false)
            return { type: "Error", content: "Something went wrong." }
          },
        }
      )
    } catch (err) {
      console.error("ERROR : ", err)
      setIsDepositLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Something went wrong." } })
    }
  }

  const actionLeverage = async () => {
    setIsDepositLoading(true)

    if (!walletClient || !currentAddress || !leveragedCollateralQuote || !borrowWeiValue) return

    const leverageData = await getRoute(
      USG_CONTRACT.USG,
      marketInfo?.collatAddress,
      borrowWeiValue,
      leveragedCollateralQuote,
      marketInfo?.marketAddress,
      USG_CONTRACT.ZAPPER,
      curveRoutes
    )

    const isReceiptIn = marketData?.constants?.receipt.toLowerCase() === depositAssetInfo?.address.toLowerCase()

    await toastTx(
      doMarketLeverage(marketInfo?.marketAddress, walletClient, depositWeiValue || 0n, borrowWeiValue, leveragedCollateralQuote, isReceiptIn, leverageData!),
      {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => {
          resetAfterLeverageSuccess()
          setIsDepositLoading(false)

          return { type: "Success", content: "Position successfully  created." }
        },
        error: () => {
          setIsDepositLoading(false)
          return { type: "Error", content: "Something went wrong." }
        },
      }
    )
  }

  const resetAfterLeverageSuccess = () => {
    setIsLeverageAllPosition(false)
    setIsDepositDisabled(false)
    setCurrentAmounts({})
    setZapValue(0n)
    setDepositWeiValue(0n)
    setBorrowWeiValue(0n)
    setLeveragedCollateralQuote(0n)
    setDepositSliderPercent(0)
    setIsDepositLoading(false)
    setLeveragePercentage(0)
    loadUSGsUSGMetrics()
    loadOnChainData()
    fetchBalanceAllowanceData(depositAssetInfo?.address)
  }

  const expectedCollateral = useMemo(() => {
    const quoteDetail = { sum: "", result: `0 ${collateralInfo?.symbol}` }

    if (marketData) {
      if (zapValue && leveragedCollateralQuote) {
        quoteDetail.sum = ` ${formatBigIntAsNumber(zapValue, 18, 3)} + ${formatBigIntAsNumber(leveragedCollateralQuote, 18, 3)}  ~= `
        quoteDetail.result = `${formatBigIntAsNumber(leveragedCollateralQuote + BigInt(zapValue || 0n), 18, 3)}  ${collateralInfo?.symbol}`
      } else if (depositWeiValue && leveragedCollateralQuote && !isLeverageAllPosition) {
        quoteDetail.sum = ` ${formatBigIntAsNumber(depositWeiValue, 18, 3)} + ${formatBigIntAsNumber(leveragedCollateralQuote, 18, 3)}  ~= `
        quoteDetail.result = `${formatBigIntAsNumber(leveragedCollateralQuote + depositWeiValue, 18, 3)}  ${collateralInfo?.symbol}`
      } else if (leveragedCollateralQuote && isDepositDisabled) {
        quoteDetail.sum = ` ${formatBigIntAsNumber(marketData?.collateralInfos?.positionCollateralAmount || 0n, 18, 3)} + ${formatBigIntAsNumber(leveragedCollateralQuote, 18, 3)}  ~= `
        quoteDetail.result = `${formatBigIntAsNumber(leveragedCollateralQuote + (marketData?.collateralInfos?.positionCollateralAmount || 0n), 18, 3)}  ${collateralInfo?.symbol}`
      } else if (depositWeiValue && leveragedCollateralQuote && isLeverageAllPosition) {
        quoteDetail.sum = ` ${formatBigIntAsNumber(marketData?.collateralInfos?.positionCollateralAmount + depositWeiValue, 18, 3)} + ${formatBigIntAsNumber(leveragedCollateralQuote, 18, 3)}  ~= `
        quoteDetail.result = `${formatBigIntAsNumber(leveragedCollateralQuote + (marketData?.collateralInfos?.positionCollateralAmount + depositWeiValue), 18, 3)}  ${collateralInfo?.symbol}`
      }
    }
    return quoteDetail
  }, [zapValue, depositWeiValue, leveragedCollateralQuote, collateralInfo?.symbol, marketData, isLeverageAllPosition, isDepositDisabled])

  const aprVariation = useMemo(() => {
    let apr = { current: "", currentUpdated: "-", projected: "", projectedUpdated: "-" }

    if (marketData) {
      if (marketAprs && zapValue && leveragedCollateralQuote) {
        apr = computeAprVariation(marketAprs, currentConvexTVL, marketData, leveragedCollateralQuote + BigInt(zapValue))
      } else if (marketAprs && depositWeiValue && leveragedCollateralQuote) {
        apr = computeAprVariation(marketAprs, currentConvexTVL, marketData, leveragedCollateralQuote + depositWeiValue)
      } else {
        apr = computeAprVariation(marketAprs, currentConvexTVL, marketData, 0n)
      }
    }
    return apr
  }, [zapValue, depositWeiValue, leveragedCollateralQuote, marketData, currentConvexTVL])

  const estimatedZapDollarValue = useMemo(() => {
    if (zapValue && marketData) {
      const result = `~(${formatDollar(formatUnits((BigInt(zapValue) * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** 18), 18))})`
      return result
    }

    return ""
  }, [zapValue])

  const leverageExceedsMaxLtv = useMemo(() => {
    const computedLtv = futureMarketDisplayData.ltv.substring(0, futureMarketDisplayData.ltv.length - 1)

    const ltvAsNumber = Number(computedLtv)

    return !!expectedCollateral && !!futureMarketDisplayData && ltvAsNumber > 90
  }, [expectedCollateral, futureMarketDisplayData])

  const leverageBalanceAllowanceData = useMemo(() => {
    if (!!marketData && depositAsset === collateralInfo?.name) {
      return { balance: marketData?.collateralBalance, allowance: marketData?.collateralAllowance }
    } else if (!!balanceAllowanceData && depositAsset !== collateralInfo?.name) {
      return { balance: balanceAllowanceData?.balance, allowance: balanceAllowanceData?.allowances[0]?.allowance }
    }
    return { balance: 0n, allowance: 0n }
  }, [marketData, balanceAllowanceData])

  const formState = useMemo(
    () =>
      getLeverageFormState(
        marketData,
        leverageExceedsMaxLtv,
        depositWeiValue,
        borrowWeiValue,
        !isDepositDisabled,
        isWellConnected,
        depositAssetInfo!,
        collateralInfo!,
        leverageBalanceAllowanceData!,
        leveragePercentage!
      ),
    [
      marketData,
      isDepositDisabled,
      borrowWeiValue,
      depositWeiValue,
      isWellConnected,
      currentAddress,
      depositAssetInfo,
      leverageBalanceAllowanceData,
      leverageExceedsMaxLtv,
      leveragePercentage,
    ]
  )

  useEffect(() => {
    if (depositAssetInfo) {
      fetchBalanceAllowanceData(depositAssetInfo?.address)
    }
  }, [depositAssetInfo])

  const updateBorrowWeiValue = async (value: bigint | undefined) => {
    if (value) {
      setIsDepositLoading(true)
      getQuote(value, currentAddress!, marketInfo?.collatAddress, USG_CONTRACT.USG, curveRoutes)
        .then(({ quote }) => {
          setLeveragedCollateralQuote(quote)
          setIsDepositLoading(false)
          setBorrowWeiValue(value)
        })
        .catch((e) => {
          console.error(e)
          toast.error(ToastComponent, { data: { type: "Error", content: "USG to Collateral quote failed." } })
        })
    }
  }

  useEffect(() => {
    if (zapValue !== undefined) {
      const updatedValue = Number(Number(formatUnits(zapValue || 0n, 18)).toFixed(3))
      setZapInnerValue(updatedValue)
    } else {
      setZapInnerValue(undefined)
    }
  }, [zapValue])

  useEffect(() => {
    if (zapInnerValue === undefined) {
      /* reset */ return
    }

    if (!isZapUserInput) return
    const handler = setTimeout(() => {
      handleZapChange({ target: { value: zapInnerValue.toString() } } as React.ChangeEvent<HTMLInputElement>)
    }, 500)
    return () => clearTimeout(handler)
  }, [zapInnerValue, isZapUserInput])

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

  const computedMaxLeverage = useMemo(() => {
    return marketData ? `Max leverage: x${Number((1 / (1 - Number(marketData?.constants.maxLTV) / 100000)).toFixed(0))}` : ""
  }, [marketData])

  const computedDepositAmount = useMemo(() => {
    if (!marketData?.collateralInfos) return 0n

    if (!isDepositDisabled && !isLeverageAllPosition) {
      return !!zapValue ? zapValue : depositWeiValue || 0n
    }

    if (isDepositDisabled && !isLeverageAllPosition) {
      return marketData?.collateralInfos?.positionCollateralAmount
    }

    if (!isDepositDisabled && isLeverageAllPosition) {
      return marketData?.collateralInfos?.positionCollateralAmount + (depositWeiValue || 0n)
    }

    return 0n
  }, [zapValue, depositWeiValue, isDepositDisabled, isLeverageAllPosition, marketData])

  const contextValue: USGLeverageContextValues = {
    collateralInfo,

    isDepositDisabled,

    setIsDepositDisabled,
    depositWeiValue,
    setDepositWeiValue,
    actionApprove,
    actionLeverage,
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
    swapAssetPrice,

    depositAssetInfo,

    slippage,
    setSlippage,

    depositSliderPercent,
    setDepositSliderPercent,

    leveragePercentage,
    setLeveragePercentage,

    leveragedCollateralQuote,
    setLeveragedCollateralQuote,

    handleZapInputChange,

    zapInnerValue,
    setZapInnerValue,

    actionZapLeverage,

    actionApproveZap,

    estimatedZapDollarValue,

    expectedCollateral,

    updateBorrowWeiValue,

    maxDepositString,

    computedMaxLeverage,

    aprVariation,

    isLeverageAllPosition,
    setIsLeverageAllPosition,

    computedDepositAmount,

    isZapping,
  }

  return <USGLeverageContext.Provider value={contextValue}>{children}</USGLeverageContext.Provider>
}

export const useUSGLeverageContext = () => {
  const context = useContext(USGLeverageContext)
  if (!context) {
    throw new Error("useUSGLeverageContext must be used within a USGLeverageProvider")
  }
  return context
}
