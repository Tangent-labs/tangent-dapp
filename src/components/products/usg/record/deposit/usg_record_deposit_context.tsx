"use client"

import { toast } from "react-toastify"
import { useUSGContext } from "../../usg_context"
import { USGMarket } from "../../usg_type"
import { getReceiptPrefix, useUSGRecordContext } from "../usg_record_context"
import { getQuote, getRoute } from "../../global_quote_controller"
import { AssetDataPriced, CollateralInfo, FormState } from "@/types"
import { useRootContext } from "@/components/products/root/root_context"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { Address, formatEther, formatUnits, parseEther, zeroAddress } from "viem"
import { formatBigInt } from "@/lib/number_formatter"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { computedMinAmountOut, computeMaxBorrowable, computeSwapAssetPrice, doApprove } from "../usg_record_controller"
import { doZapDeposit, doZapDepositAndBorrow, getDepositFormState, doMarketDeposit, doMarketDepositAndBorrow } from "./usg_record_deposit_controller"
import { Erc20Details, ERC20S } from "@/data/erc20s"
import { BuyAndMinOutFormatted } from "../leverage/usg_record_leverage_context"

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
  isDepositLoading: boolean
  setIsDepositLoading: (arg: boolean) => void
  isZapLoading: boolean
  setIsZapLoading: (arg: boolean) => void
  swapAssetPrice: number | null
  getRouteAndDeposit: () => void
  actionApproveZap: () => void
  zapValue: bigint | undefined
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
  handleZapInputChange: (arg: bigint | undefined) => void

  maxBorrowableValue: bigint

  zapValuesFormatted: BuyAndMinOutFormatted

  maxDepositString: string

  isZapping: boolean

  isTxLoading: boolean

  // aprVariation: AprVariation
}

export const USGDepositContext = createContext<USGDepositContextValues | undefined>(undefined)

export const USGDepositProvider = ({ children, isDepositAndBorrowInput }: USGDepositContextProps) => {
  const { curveRoutes, handleQuote } = useRootContext()

  const { loadUSGsUSGMetrics } = useUSGContext()

  const { isWellConnected, walletClient, currentAddress } = useWalletConnexionContext()

  const {
    marketData,
    loadOnChainData,
    setCurrentAmounts,
    balanceAllowanceData,
    isDepositAndBorrow,
    fetchBalanceAllowanceData,
    collateralInfo,
    marketInfo,
    setIsDepositAndBorrow,
  } = useUSGRecordContext()

  const lastApproveRef = useRef<number>(0)

  const lastDepositRef = useRef<number>(0)

  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()

  const [depositAsset, setDepositAsset] = useState<string>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

  const [borrowSliderPercent, setBorrowSliderPercent] = useState<number>(0)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [isDepositLoading, setIsDepositLoading] = useState(false)

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [isTxLoading, setIsTxLoading] = useState(false)

  const [zapValue, setZapValue] = useState<bigint | undefined>()

  const [zapInnerValue, setZapInnerValue] = useState<number | undefined>(zapValue !== undefined ? Number(formatUnits(zapValue || BigInt(0), 18)) : undefined)

  const [isZapUserInput, setIsZapUserInput] = useState<boolean>(false)

  const [slippage, setSlippage] = useState<number>(0.2)

  const depositAssetInfo = useMemo<AssetDataPriced | CollateralInfo>(() => {
    // When market data is not charged
    if (!!marketData && (depositAsset === undefined || depositAsset === collateralInfo.name)) {
      return {
        ...collateralInfo,
        decimals: collateralInfo.decimals,
        address: collateralInfo.address as Address,
        logokey: collateralInfo.logoKey,
        name: collateralInfo.name,
        symbol: collateralInfo.symbol,
        price: Number(formatUnits(marketData.collateralInfos.collateralUSDPrice, 18)),
      }
    }

    const assetInfo = ERC20S.find((el: Erc20Details) => el.name === depositAsset || el.symbol === depositAsset) || undefined

    if (!swapAssetPrice || !assetInfo) return collateralInfo

    const asset: AssetDataPriced = {
      address: assetInfo?.address as Address,
      decimals: assetInfo?.decimals,
      displayDecimals: 2,
      symbol: assetInfo?.symbol,
      name: assetInfo?.name,
      price: swapAssetPrice,
    }
    return asset
  }, [depositAsset, swapAssetPrice, marketData])

  const isZapping = useMemo(() => {
    const marketType = marketData?.marketType
    if (!depositAsset) return false

    return ![collateralInfo?.symbol, `${getReceiptPrefix(marketType)}${collateralInfo?.symbol}`].includes(depositAsset)
  }, [depositAsset, collateralInfo?.symbol])

  //  useEffects

  useEffect(() => {
    setIsDepositAndBorrow(isDepositAndBorrowInput)
  }, [])

  useEffect(() => {
    if (collateralInfo) {
      setDepositAsset(collateralInfo.name)
    }
  }, [collateralInfo?.name])

  // Fetch balance and allowances of new depositAsset
  useEffect(() => {
    if (depositAssetInfo) {
      fetchBalanceAllowanceData(depositAssetInfo?.address)
    }
  }, [depositAssetInfo])

  // Reset form when deposit asset is changed
  useEffect(() => {
    if (depositAsset) {
      setBorrowWeiValue(undefined)
      setDepositWeiValue(undefined)
      setZapValue(undefined)
      setBorrowSliderPercent(0)
    }
  }, [depositAsset])

  useEffect(() => {
    if (!isDepositAndBorrow) {
      setBorrowWeiValue(undefined)
      setBorrowSliderPercent(0)
    }
  }, [isDepositAndBorrow])

  useEffect(() => {
    if (zapValue !== undefined) {
      const updatedValue = Number(Number(formatUnits(zapValue || 0n, collateralInfo!.decimals)).toFixed(3))
      setZapInnerValue(updatedValue)
      setIsZapUserInput(false)
    } else {
      setZapInnerValue(undefined)
    }
  }, [zapValue])

  useEffect(() => {
    if (zapInnerValue === undefined) {
      setDepositWeiValue(undefined)
      setZapValue(undefined)
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
        const data = await computeSwapAssetPrice(depositAsset)

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

  /**
   * Call back method to prevent loadDataAfterApprove
   * to be called multiple times at once
   */
  const loadDataAfterApprove = useCallback((assetAddress: Address, isZap = false) => {
    const now = Date.now()
    if (now - lastApproveRef.current < 6000) {
      return
    }

    lastApproveRef.current = now

    if (!isZap) {
      loadOnChainData()
    }

    fetchBalanceAllowanceData(assetAddress)
    setIsTxLoading(false)
  }, [])

  // Handle inputs
  const latestRequestRef = useRef(0)

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)

    if (!value || !depositAssetInfo || !isZapping) {
      if (!value || value === 0n) setZapValue(undefined)
      return
    }

    const requestId = ++latestRequestRef.current
    setIsZapLoading(true)

    getQuote(value, currentAddress || zeroAddress, marketInfo?.collatAddress, depositAssetInfo?.address, curveRoutes)
      .then(({ quote }) => {
        // Do nothing when price is stale
        if (requestId !== latestRequestRef.current) return // stale
        handleQuote(quote)
        if (quote) setZapValue(quote)
      })
      .catch((error) => {
        if (requestId !== latestRequestRef.current) return
        console.error("Error fetching zap value:", error)
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) setIsZapLoading(false)
      })
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

  const handleZapInputChange = (v: bigint | undefined) => {
    const value = v || 0n
    const zapValueNumber = Number(formatEther(value))
    setZapInnerValue(zapValueNumber)
    setIsZapUserInput(true)
  }

  // useMemos

  const maxBorrowableValue = useMemo(() => {
    const deposit = depositWeiValue || 0n

    if (marketData) {
      const futureDebt = marketData?.debtInfos?.userDebt
      let futureDeposited

      if (isZapping && zapValue) {
        futureDeposited =
          marketData?.collateralInfos?.positionCollateralUSDValue +
          (computedMinAmountOut(zapValue, slippage) * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** collateralInfo?.decimals)
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

  const zapValuesFormatted = useMemo(() => {
    if (!isZapLoading) {
      if (zapValue && marketData) {
        const minAmountOutWei = computedMinAmountOut(zapValue, slippage)
        const decimals = collateralInfo?.decimals || 18
        const displayDecimals = collateralInfo?.displayDecimals || 2

        return {
          expectedFormatted: `${formatBigInt(zapValue, decimals, displayDecimals)} `,
          minOutFormatted: `${formatBigInt(minAmountOutWei, decimals, displayDecimals)}`,
        }
      }
    }

    return { expectedFormatted: `-`, minOutFormatted: `-` }
  }, [zapValue, isZapLoading, slippage])

  const maxDepositString = useMemo(() => {
    const asset = depositAssetInfo?.symbol?.replaceAll("-", "/")

    let amountDisplayed = "0"

    if (!!balanceAllowanceData && currentAddress && (isZapping || depositAssetInfo?.address == marketData?.constants?.receipt)) {
      amountDisplayed = formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)
    }
    if (currentAddress && !isZapping) {
      amountDisplayed = formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)
    }
    return `Max ${amountDisplayed} ${asset}`
  }, [currentAddress, depositAssetInfo, balanceAllowanceData, isZapping])

  // const aprVariation = useMemo(() => {
  //   let result = { current: "", currentUpdated: "-", projected: "", projectedUpdated: "-" }

  //   if (marketAprs && marketData && currentConvexTVL) {
  //     if (zapValue && isZapping) {
  //       result = computeAprVariation(marketAprs, currentConvexTVL, marketData, BigInt(zapValue))
  //     } else if (!isZapping && depositWeiValue) {
  //       result = computeAprVariation(marketAprs, currentConvexTVL, marketData, depositWeiValue)
  //     } else {
  //       result = computeAprVariation(marketAprs, currentConvexTVL, marketData, 0n)
  //     }
  //   }
  //   return result
  // }, [zapValue, depositWeiValue, collateralInfo?.symbol, marketAprs, marketData, currentConvexTVL, isZapping])

  const formState = useMemo(() => {
    return getDepositFormState(
      marketData,
      depositWeiValue,
      borrowWeiValue,
      isDepositAndBorrow,
      isWellConnected,
      depositAssetInfo?.address,
      collateralInfo!,
      balanceAllowanceData!,
      maxBorrowableValue || 0n,
      isZapLoading
    )
  }, [
    isDepositLoading,
    isZapLoading,
    isTxLoading,
    marketData,
    isDepositAndBorrow,
    borrowWeiValue,
    depositWeiValue,
    isWellConnected,
    currentAddress,
    depositAssetInfo,
    balanceAllowanceData,
  ])

  //  ACTIONS

  const actionApproveZap = async () => {
    setIsTxLoading(true)

    try {
      if (!walletClient || !depositAssetInfo) throw new Error("Wallet not available")

      await toastTx(doApprove(walletClient, depositAssetInfo.address, marketInfo.marketAddress, depositWeiValue ?? 0n), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
        success: () => {
          loadDataAfterApprove(depositAssetInfo?.address, true)
          return { type: "Success", content: `${depositAssetInfo?.symbol} approved successfully.` }
        },
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsTxLoading(false)
    }
  }

  const actionApprove = async () => {
    setIsTxLoading(true)
    if (walletClient && depositWeiValue) {
      await toastTx(doApprove(walletClient, depositAssetInfo?.address, marketInfo?.marketAddress, depositWeiValue), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
        success: () => {
          loadDataAfterApprove(depositAssetInfo?.address, false)

          return { type: "Success", content: `${depositAssetInfo?.symbol} approved successfully.` }
        },
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
    setIsTxLoading(true)

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
            setIsTxLoading(false)
            return { type: "Error", content: "Unable to proceed with the transaction." }
          },
        }
      )
    } else {
      setIsTxLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Unable to proceed with the transaction." } })
    }
  }

  const deposit = async () => {
    setIsTxLoading(true)

    if (walletClient && depositWeiValue) {
      const isReceiptIn = marketData?.constants?.receipt.toLowerCase() === depositAssetInfo?.address.toLowerCase()

      await toastTx(doMarketDeposit(walletClient, { depositWeiValue, marketAddress: marketInfo?.marketAddress, borrowWeiValue, isReceiptIn }), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => {
          resetAfterDepositSuccess()
          return { type: "Success", content: "Position successfully created." }
        },
        error: () => {
          setIsTxLoading(false)
          return { type: "Error", content: "Unable to proceed with the transaction." }
        },
      })
    } else {
      setIsTxLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Unable to proceed with the transaction." } })
    }
  }

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

    setIsTxLoading(true)

    try {
      const zapData = await getRoute(
        depositAssetInfo?.address,
        collateralInfo!.address,
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

      await toastTx(
        doZapDepositAndBorrow(marketInfo?.marketAddress, walletClient!, zapData?.routerAddress, zapData?.data as string, zapMarketData, borrowWeiValue),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => {
            resetAfterDepositSuccess()
            return { type: "Success", content: "Position successfully created." }
          },
          error: () => {
            setIsTxLoading(false)

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

    setIsTxLoading(true)

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

      await toastTx(doZapDeposit(marketInfo?.marketAddress, walletClient!, zapData?.routerAddress, zapData?.data as string, zapMarketData), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => {
          resetAfterDepositSuccess()
          return { type: "Success", content: "Position successfully created." }
        },
        error: () => {
          setIsTxLoading(false)
          return { type: "Error", content: "Unable to proceed with the transaction." }
        },
      })
    } catch (error) {
      console.error("Error in zapAndDeposit:", error)
      setIsTxLoading(false)
    }
  }

  /**
   * Call back method to prevent resetAfterDepositSuccess
   * to be called multiple times at once
   */
  const resetAfterDepositSuccess = useCallback(() => {
    const now = Date.now()
    if (now - lastDepositRef.current < 6000) {
      return
    }

    lastDepositRef.current = now

    loadOnChainData()
    loadUSGsUSGMetrics()
    setDepositWeiValue(undefined)
    setBorrowWeiValue(undefined)
    setZapValue(undefined)
    setIsZapLoading(false)
    setBorrowSliderPercent(0)
    setDepositSliderPercent(0)
    setIsDepositLoading(false)
    setIsTxLoading(false)

    fetchBalanceAllowanceData(depositAssetInfo?.address)
  }, [
    loadOnChainData,
    loadUSGsUSGMetrics,
    setDepositWeiValue,
    setBorrowWeiValue,
    setZapValue,
    setIsZapLoading,
    setIsTxLoading,
    setBorrowSliderPercent,
    setDepositSliderPercent,
    setIsDepositLoading,
    fetchBalanceAllowanceData,
    depositAssetInfo?.address,
  ])

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

    zapValuesFormatted,

    maxDepositString,

    isZapping,

    isTxLoading,
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
