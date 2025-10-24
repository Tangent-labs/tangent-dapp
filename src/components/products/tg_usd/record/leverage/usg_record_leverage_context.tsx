"use client"

import { toast } from "react-toastify"
import { ZapToken } from "../../tg_usd_type"
import { formatUnits, parseEther } from "viem"
import { useUSGContext } from "../../tg_usd_context"
import { USG_CONTRACT } from "../../tg_usd_repository"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { ToastComponent } from "@/components/design_system/toast"
import { getQuote, getRoute } from "../../global_quote_controller"
import { AssetDataPriced, CollateralInfo, FormState } from "@/types"
import { useRootContext } from "@/components/products/root/root_context"
import { computeSwapAssetPrice, doApprove } from "../tg_usd_record_controller"
import { formatBigInt, formatBigIntAsNumber, formatDollar } from "@/lib/number_formatter"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { doMarketLeverage, doZapLeverage, getLeverageFormState } from "./usg_record_leverage_controller"

type USGLeverageContextProps = {
  children: ReactNode
}

type USGLeverageContextValues = {
  collateralInfo: AssetDataPriced

  isDepositDisabled: boolean
  setIsDepositDisabled: (arg: boolean) => void

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

  quoteDetail: { sum: string; result: string }

  estimatedZapDollarValue: string

  leverageExceedsMaxLtv: boolean

  updateBorrowWeiValue: (value: bigint) => Promise<void>

  maxDepositString: string
}

export const USGLeverageContext = createContext<USGLeverageContextValues | undefined>(undefined)

export const USGLeverageProvider = ({ children }: USGLeverageContextProps) => {
  const { curveRoutes, handleQuote } = useRootContext()

  const { tokens, loadUSGsUSGMetrics } = useUSGContext()

  const {
    marketData,
    marketInfo,
    balanceAllowanceData,
    futureMarketDisplayData,
    collateralInfo,
    fetchBalanceAllowanceData,
    loadOnChainData,
    setCurrentAmounts,
  } = useUSGRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isDepositDisabled, setIsDepositDisabled] = useState<boolean>(false)

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

  const [slippage, setSlippage] = useState<number>(1)

  const depositAssetInfo = useMemo<AssetDataPriced | CollateralInfo>(() => {
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
    if (zapValue && depositWeiValue && borrowWeiValue && leveragedCollateralQuote && !isDepositLoading) {
      setCurrentAmounts({
        depositWeiValue: (depositWeiValue || 0n) + (leveragedCollateralQuote || 0n),
        borrowWeiValue: borrowWeiValue || 0n,
        zapValue: (BigInt(zapValue) || 0n) + (leveragedCollateralQuote || 0n),
      })
    } else if (depositWeiValue && borrowWeiValue && leveragedCollateralQuote && !isDepositLoading) {
      setCurrentAmounts({
        depositWeiValue: (depositWeiValue || 0n) + (leveragedCollateralQuote || 0n),
        borrowWeiValue: borrowWeiValue || 0n,
        zapValue: 0n,
      })
    }
  }, [depositWeiValue, borrowWeiValue, zapValue, leveragedCollateralQuote, isDepositLoading])

  const actionApproveZap = () => {
    setIsDepositLoading(true)
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue)
      doApprove(walletClient, depositAssetInfo?.address, marketInfo?.marketAddress, depositWeiValue || 0n)
        .then(() => {
          fetchBalanceAllowanceData(depositAssetInfo?.address)
          setIsDepositLoading(false)
        })
        .catch((error) => {
          console.error("Error during approval:", error)
          setIsDepositLoading(false)
        })
  }

  const actionApprove = () => {
    setIsDepositLoading(true)
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue)
      doApprove(walletClient, marketInfo?.collatAddress, marketInfo?.marketAddress, depositWeiValue).then(() => {
        loadOnChainData()
      })
  }

  const actionZapLeverage = async () => {
    setIsDepositLoading(true)
    try {
      const walletClient = getWalletClient()

      if (!walletClient || !currentAddress || !depositWeiValue || !borrowWeiValue || !depositAssetInfo) return

      const leverageData = await getRoute(
        USG_CONTRACT.USG,
        marketInfo?.collatAddress,
        borrowWeiValue,
        (BigInt(leveragedCollateralQuote!) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        marketInfo?.marketAddress,
        USG_CONTRACT.ZAPPER,
        curveRoutes
      )

      const zapData = await getRoute(
        depositAssetInfo?.address,
        marketInfo?.collatAddress,
        depositWeiValue,
        (BigInt(zapValue!) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        marketInfo?.marketAddress,
        currentAddress!,
        curveRoutes,
        currentAddress!
      )

      doZapLeverage(
        borrowWeiValue,
        (BigInt(leveragedCollateralQuote!) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        leverageData!,
        depositAssetInfo?.address,
        depositWeiValue,
        (BigInt(zapValue!) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        zapData!,
        walletClient,
        marketInfo?.marketAddress
      )
        .then(() => {
          resetAfterLeverageSuccess()
          toast.success(ToastComponent, { data: { type: "Success", content: "Position successfully created." } })
          setIsDepositLoading(false)
        })
        .catch((err) => {
          console.error("ERROR : ", err)
          setIsDepositLoading(false)
          toast.error(ToastComponent, { data: { type: "Error", content: "Something went wrong." } })
        })
    } catch (err) {
      console.error("ERROR : ", err)
      setIsDepositLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Something went wrong." } })
    }
  }

  const actionLeverage = async () => {
    setIsDepositLoading(true)

    const walletClient = getWalletClient()

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

    doMarketLeverage(marketInfo?.marketAddress, walletClient, depositWeiValue || 0n, borrowWeiValue, leveragedCollateralQuote, leverageData!)
      .then(() => {
        resetAfterLeverageSuccess()
        toast.success(ToastComponent, { data: { type: "Success", content: "Position successfully created." } })
      })
      .catch((err) => {
        console.error("ERROR : ", err)
      })
  }

  const resetAfterLeverageSuccess = () => {
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

  const quoteDetail = useMemo(() => {
    if (zapValue) {
      const sum = ` ${formatBigIntAsNumber(zapValue || 0n, 18, 0)} + ${formatBigIntAsNumber(leveragedCollateralQuote || 0n, 18, 0)}  ~= `
      const result = `${formatBigIntAsNumber((leveragedCollateralQuote || 0n) + BigInt(zapValue || 0n), 18, 0)}  ${collateralInfo?.symbol}`
      return { sum, result }
    } else if (depositWeiValue) {
      const sum = ` ${formatBigIntAsNumber(depositWeiValue || 0n, 18, 0)} + ${formatBigIntAsNumber(leveragedCollateralQuote || 0n, 18, 0)}  ~= `
      const result = `${formatBigIntAsNumber((leveragedCollateralQuote || 0n) + (depositWeiValue || 0n), 18, 0)}  ${collateralInfo?.symbol}`
      return { sum, result }
    }
    return { sum: "", result: `0 ${collateralInfo?.symbol}` }
  }, [
    zapValue,
    depositWeiValue,
    leveragedCollateralQuote,
    collateralInfo?.symbol, // include symbol
  ])

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

    return !!quoteDetail && !!futureMarketDisplayData && ltvAsNumber > 90
  }, [quoteDetail, futureMarketDisplayData])

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
        isDepositLoading
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
      isDepositLoading,
      leverageExceedsMaxLtv,
    ]
  )

  useEffect(() => {
    if (depositAssetInfo) {
      fetchBalanceAllowanceData(depositAssetInfo?.address)
    }
  }, [depositAssetInfo])

  const updateBorrowWeiValue = async (value: bigint) => {
    setIsDepositLoading(true)
    getQuote(value, currentAddress!, marketInfo?.collatAddress, USG_CONTRACT.USG, curveRoutes).then(({ quote }) => {
      setLeveragedCollateralQuote(quote)
      setIsDepositLoading(false)
      setBorrowWeiValue(value)
    })
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
    if (!!balanceAllowanceData && currentAddress && depositAsset !== collateralInfo?.name) {
      return `Max ${formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)}  ${depositAssetInfo?.symbol}`
    }
    if (currentAddress && depositAsset === collateralInfo?.name) {
      return `Max ${formatBigInt(marketData?.collateralBalance, depositAssetInfo?.decimals, 2)} ${depositAssetInfo?.symbol}`
    }
    return `Max 0 ${depositAssetInfo?.symbol}`
  }, [depositAsset, collateralInfo, currentAddress, depositAssetInfo, balanceAllowanceData])

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

    quoteDetail,

    leverageExceedsMaxLtv,

    updateBorrowWeiValue,

    maxDepositString,
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
