"use client"

import { toast } from "react-toastify"
import { formatEther, formatUnits, parseEther } from "viem"
import { useUSGContext } from "../../usg_context"
import { USG_CONTRACT } from "../../usg_repository"
import { getReceiptPrefix, useUSGRecordContext } from "../usg_record_context"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { getQuote, getRoute } from "../../global_quote_controller"
import { AssetDataPriced, CollateralInfo, FormState } from "@/types"
import { useRootContext } from "@/components/products/root/root_context"
import { formatBigInt, formatBigIntAsNumber, truncateDecimals } from "@/lib/number_formatter"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { doMarketLeverage, doZapLeverage, getLeverageFormState } from "./usg_record_leverage_controller"
import { computeAprVariation, computedMinAmountOut, computeSwapAssetPrice, doApprove } from "../usg_record_controller"
import { useUSGMaketListContext } from "../../list/usg_market_list_context"
import { Erc20Details, ERC20S } from "@/data/erc20s"

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

  isDepositLoading: boolean
  setIsDepositLoading: (arg: boolean) => void

  isZapLoading: boolean
  setIsZapLoading: (arg: boolean) => void

  swapAssetPrice: number | null

  zapValue: bigint | undefined
  setZapValue: (arg: bigint) => void
  handleDepositChange: (arg: bigint | undefined) => void
  depositAssetInfo: AssetDataPriced | CollateralInfo

  slippage: number
  setSlippage: (arg: number) => void

  depositSliderPercent: number
  setDepositSliderPercent: (arg: number) => void

  leveragePercentage: number
  setLeveragePercentage: (arg: number) => void

  handleZapInputChange: (arg: bigint | undefined) => void

  actionLeverage: () => void

  actionZapLeverage: () => void

  leveragedCollateralQuote: bigint | undefined
  setLeveragedCollateralQuote: (arg: bigint) => void

  expectedCollateral: { sum: string; result: string }

  minValueReceivedFromZap: string
  minCollatReceivedFromUSGDump: string

  maxDepositString: string

  computedMaxLeverage: string

  aprVariation: { current: string; currentUpdated: string; projected: string; projectedUpdated: string }

  computedDepositAmount: bigint

  isZapping: boolean

  handleLeverageSliderChange: (arg: number) => void

  handleBorrowChange: (arg: bigint | undefined) => Promise<void>

  sliderLegendValues?: string[] | undefined

  startEndRange?: [string, string, string] | undefined
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

  const { globalData } = useUSGMaketListContext()

  const { curveRoutes, handleQuote } = useRootContext()

  const { loadUSGsUSGMetrics, marketAprs } = useUSGContext()

  const { isWellConnected, walletClient, currentAddress } = useWalletConnexionContext()

  const [isDepositDisabled, setIsDepositDisabled] = useState<boolean>(false)

  const [isLeverageAllPosition, setIsLeverageAllPosition] = useState<boolean>(false)

  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()

  const [depositAsset, setDepositAsset] = useState<string | undefined>(undefined)

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

  const [leveragePercentage, setLeveragePercentage] = useState<number>(1)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [isDepositLoading, setIsDepositLoading] = useState(false)

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [zapValue, setZapValue] = useState<bigint | undefined>()

  const [leveragedCollateralQuote, setLeveragedCollateralQuote] = useState<bigint | undefined>()

  const [slippage, setSlippage] = useState<number>(0.2)

  const isZapping = useMemo(() => {
    const marketType = marketData?.marketType
    if (!depositAsset) return false

    return ![collateralInfo?.symbol, `${getReceiptPrefix(marketType)}${collateralInfo?.symbol}`].includes(depositAsset)
  }, [depositAsset, collateralInfo?.symbol])

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

    if (!!marketData && (depositAsset === undefined || depositAsset === collateralInfo?.name)) {
      return { ...collateralInfo, price: Number(formatUnits(marketData?.collateralInfos.collateralUSDPrice, 18)) }
    }

    const assetInfo = ERC20S.find((el: Erc20Details) => el.name === depositAsset || el.symbol === depositAsset) || undefined

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

  function computeBorrowValue(depositedCollateralWei: bigint, leverageValue: number) {
    const collatToBuy = (depositedCollateralWei * BigInt(leverageValue * 100)) / 100n - depositedCollateralWei
    const collatPrice = marketData?.collateralInfos.collateralUSDPrice || 0n
    const expectedCollateralFinalDollarValue = (collatToBuy * collatPrice) / parseEther("1")
    return (expectedCollateralFinalDollarValue * parseEther("1")) / globalData.usgPriceWei
  }
  const activeInputRef = useRef<"deposit" | "zap" | null>(null)
  const requestIdRef = useRef<number>(0)

  function handleDepositChange(value: bigint | undefined) {
    activeInputRef.current = "deposit"
    const valueWei = BigInt(value || 0n)
    setDepositWeiValue(valueWei)

    if (!value || !currentAddress || !depositAssetInfo) {
      updateBorrowWeiValue(computeBorrowValue(valueWei, leveragePercentage))
      return
    }

    if (depositAssetInfo.address === marketInfo?.collatAddress) {
      updateBorrowWeiValue(computeBorrowValue(valueWei, leveragePercentage))
      return
    }

    const requestId = ++requestIdRef.current
    setIsZapLoading(true)

    getQuote(value, currentAddress, marketInfo?.collatAddress, depositAssetInfo?.address, curveRoutes)
      .then(({ quote }) => {
        if (requestId !== requestIdRef.current) return
        if (quote) {
          setZapValue(quote as bigint)
          updateBorrowWeiValue(computeBorrowValue(quote as bigint, leveragePercentage))
        }
      })
      .catch((e) => {
        if (requestId !== requestIdRef.current) return
        console.error("Error fetching zap value:", e)
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsZapLoading(false)
      })
  }

  function handleZapInputChange(value: bigint | undefined) {
    activeInputRef.current = "zap"
    setZapValue(value ?? 0n)

    if (!value || !currentAddress || !depositAssetInfo) {
      setDepositWeiValue(undefined)
      return
    }

    const requestId = ++requestIdRef.current
    setIsDepositLoading(true)

    getQuote(value, currentAddress, depositAssetInfo?.address, marketInfo?.collatAddress, curveRoutes)
      .then(({ quote }) => {
        if (requestId !== requestIdRef.current) return
        handleQuote(quote)
        if (quote) setDepositWeiValue(quote)
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return
        console.error("Error fetching depositWeiValue:", err)
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsDepositLoading(false)
      })
  }

  async function handleBorrowChange(borrowValue: bigint | undefined) {
    await updateBorrowWeiValue(borrowValue)
    const collatPrice = marketData?.collateralInfos.collateralUSDPrice || 0n
    const depositDollarValueWei = ((depositWeiValue || 0n) * collatPrice) / parseEther("1")
    const totalCollatDollarValue = depositDollarValueWei + (borrowValue || 0n)
    const leverageMultiplicator = Number(formatEther((totalCollatDollarValue * parseEther("1")) / depositDollarValueWei))
    setLeveragePercentage(leverageMultiplicator)
  }

  const leverageDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleLeverageSliderChange(leverageValue: number) {
    setLeveragePercentage(leverageValue)

    if (leverageDebounceRef.current) clearTimeout(leverageDebounceRef.current)

    leverageDebounceRef.current = setTimeout(() => {
      const collateralAmount = isZapping && zapValue ? BigInt(zapValue) : BigInt(depositWeiValue || 0n)
      updateBorrowWeiValue(computeBorrowValue(collateralAmount, leverageValue))
    }, 400)
  }

  useEffect(() => {
    if (!depositAsset) return

    const fetchSwapAssetData = async () => {
      setIsZapLoading(true)
      try {
        const data = await computeSwapAssetPrice(depositAsset)
        setSwapAssetPrice(data || 0)
      } catch (error) {
        console.error("Error fetching Enso data:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    fetchSwapAssetData()

    setDepositWeiValue(undefined)
    setDepositSliderPercent(0)

    setZapValue(undefined)

    setBorrowWeiValue(undefined)
    setLeveragePercentage(1)

    setLeveragedCollateralQuote(undefined)
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
          setIsDepositLoading(false)
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
    setZapValue(undefined)
    setDepositWeiValue(undefined)
    setBorrowWeiValue(undefined)
    setLeveragedCollateralQuote(undefined)
    setDepositSliderPercent(0)
    setIsDepositLoading(false)
    setLeveragePercentage(1)
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

  const minValueReceivedFromZap = useMemo(() => {
    if (zapValue) {
      const minAmountOutWei = computedMinAmountOut(zapValue, slippage)
      const result = `(${truncateDecimals(formatUnits(minAmountOutWei, collateralInfo?.decimals), collateralInfo.displayDecimals)})`
      return result
    }

    return ""
  }, [zapValue, slippage])

  const minCollatReceivedFromUSGDump = useMemo(() => {
    if (leveragedCollateralQuote) {
      const minAmountOutWei = computedMinAmountOut(leveragedCollateralQuote, slippage)
      const result = `(${truncateDecimals(formatUnits(minAmountOutWei, collateralInfo?.decimals), collateralInfo.displayDecimals)})`
      return result
    }

    return ""
  }, [leveragedCollateralQuote, slippage])

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

  const maxDepositString = useMemo(() => {
    const asset = depositAssetInfo?.symbol

    let amountDisplayed = "0"

    if (!!balanceAllowanceData && currentAddress && (isZapping || depositAssetInfo?.address == marketData?.constants?.receipt)) {
      amountDisplayed = formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)
    }
    if (currentAddress && !isZapping) {
      amountDisplayed = formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)
    }
    return `Max ${amountDisplayed} ${asset}`
  }, [currentAddress, depositAssetInfo, balanceAllowanceData, isZapping])

  const computedMaxLeverage = useMemo(() => {
    if (!marketData) return ""
    const leverage = 1 / (1 - Number(marketData.constants.maxLTV) / 100000)
    const rounded = Math.floor(leverage * 100) / 100

    return `Max leverage: x${rounded}`
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

  const sliderLegendValues = useMemo(() => {
    const ltv = Number(marketData?.constants?.maxLTV) / 100000
    const maxLeverageRaw = 1 / (1 - ltv)

    const rounded = Math.floor(maxLeverageRaw * 100) / 100

    return Array.from({ length: rounded }, (_, i) => String(i + 1))
  }, [marketData?.constants])

  const startEndRange = useMemo(() => {
    const ltv = Number(marketData?.constants?.maxLTV) / 100000
    const maxLeverageRaw = 1 / (1 - ltv)

    const rounded = Math.floor(maxLeverageRaw * 100) / 100

    return ["1", String(rounded), "0.1"] as [string, string, string]
  }, [marketData?.constants])

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

    actionZapLeverage,

    actionApproveZap,

    minValueReceivedFromZap,
    minCollatReceivedFromUSGDump,

    expectedCollateral,

    maxDepositString,

    computedMaxLeverage,

    aprVariation,

    isLeverageAllPosition,
    setIsLeverageAllPosition,

    computedDepositAmount,

    isZapping,
    handleLeverageSliderChange,
    handleBorrowChange,

    sliderLegendValues,

    startEndRange,
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
