"use client"

import { toast } from "react-toastify"
import { USGMarket } from "../../usg_type"
import { useUSGContext } from "../../usg_context"
import { Erc20Details, ERC20S } from "@/data/erc20s"
import { formatBigInt } from "@/lib/number_formatter"
import { getQuote, getRoute } from "../../global_quote_controller"
import { AssetDataPriced, CollateralInfo, FormState } from "@/types"
import { useRootContext } from "@/components/products/root/root_context"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { getReceiptPrefix, useUSGRecordContext } from "../usg_record_context"
import { Address, formatEther, formatUnits, parseEther, zeroAddress } from "viem"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { doMarketDeposit, doMarketDepositAndBorrow, doZapDeposit, doZapDepositAndBorrow, getDepositFormState } from "./usg_record_deposit_controller"
import {
  computedMinAmountOut,
  computeMaxBorrowable,
  computeSwapAssetPrice,
  computeTransactionPotentialLoss,
  doApprove,
  matchBlockChainErrors,
} from "../usg_record_controller"
import { BuyAndMinOutFormatted } from "../leverage/types"

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
  slippageLoss: { tokenLoss: string; dollarLoss: string }

  isTransactionBlockedBySlippage: boolean
  setIsTransactionBlockedBySlippage: (arg: boolean) => void

  priceImpactLoss: string

  priceImpact: number

  isTransactionBlockedByPriceImpact: boolean
  setIsTransactionBlockedByPriceImpact: (arg: boolean) => void
}

export const USGDepositContext = createContext<USGDepositContextValues | undefined>(undefined)

export const USGDepositProvider = ({ children, isDepositAndBorrowInput }: USGDepositContextProps) => {
  // ────────────────────────────────────────
  //              PARENT CONTEXTS
  // ────────────────────────────────────────
  const { curveRoutes, handleQuote } = useRootContext()

  const { USGsUSGMetrics, loadUSGsUSGMetrics } = useUSGContext()

  const { isWellConnected, walletClient, currentAddress, isWalletContextLoaded, isConnected } = useWalletConnexionContext()

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
    isTxLoading,
    setIsTxLoading,
  } = useUSGRecordContext()

  // ────────────────────────────────────────
  //             USE STATE
  // ────────────────────────────────────────

  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()

  const [depositAsset, setDepositAsset] = useState<string>()

  const [swapAssetPrice, setSwapAssetPrice] = useState<number>(0)

  const [borrowSliderPercent, setBorrowSliderPercent] = useState<number>(0)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [isDepositLoading, setIsDepositLoading] = useState(false)

  const [isZapLoading, setIsZapLoading] = useState(false)

  const [zapValue, setZapValue] = useState<bigint | undefined>()

  const [zapInnerValue, setZapInnerValue] = useState<number | undefined>(zapValue !== undefined ? Number(formatUnits(zapValue || BigInt(0), 18)) : undefined)

  const [isZapUserInput, setIsZapUserInput] = useState<boolean>(false)

  const [slippage, setSlippage] = useState<number>(0.2)

  const [isTransactionBlockedBySlippage, setIsTransactionBlockedBySlippage] = useState<boolean>(false)

  const [isTransactionBlockedByPriceImpact, setIsTransactionBlockedByPriceImpact] = useState<boolean>(false)

  const [priceImpact, setPriceImpact] = useState<number>(0)

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
      displayDecimals: assetInfo?.displayDecimals || 2,
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

  // ────────────────────────────────────────
  //              USE EFFECTS
  // ────────────────────────────────────────

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
    if (depositAssetInfo && isWalletContextLoaded) {
      fetchBalanceAllowanceData(depositAssetInfo?.address)
    }
  }, [depositAssetInfo.address, isWalletContextLoaded, currentAddress, isConnected])

  const handleZapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZapValue(parseEther(e?.target?.value))
    setPriceImpact(0)

    if (e?.target?.value === "") {
      setDepositWeiValue(undefined)
      return
    }

    const debounceTimeout = setTimeout(async () => {
      if (!parseEther(e?.target?.value) || !currentAddress || !depositAssetInfo) return
      setIsDepositLoading(true)

      try {
        const { quote, priceImpact: pI } = await getQuote(
          parseEther(e?.target?.value),
          currentAddress,
          depositAssetInfo?.address,
          marketInfo?.collatAddress,
          curveRoutes
        )

        const { validQuote, validPriceImpact } = handleQuote(quote, pI)

        if (validPriceImpact >= 0 && validQuote) {
          setDepositWeiValue(BigInt(validQuote))
          setPriceImpact(Number(validPriceImpact) / 100)
        } else {
          setDepositWeiValue(undefined)
        }
      } catch (error) {
        console.error("Error fetching depositWeiValue:", error)
      } finally {
        setIsDepositLoading(false)
      }
    }, 500)

    return () => clearTimeout(debounceTimeout)
  }

  // Reset form when deposit asset is changed
  useEffect(() => {
    if (depositAsset) {
      setBorrowWeiValue(undefined)
      setDepositWeiValue(undefined)
      setZapValue(undefined)
      setBorrowSliderPercent(0)
      setPriceImpact(0)

      if (depositAsset === collateralInfo?.name) {
        setSlippage(0.2)
      }
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
        const data = await computeSwapAssetPrice(depositAsset, USGsUSGMetrics!.sUSGPrice, USGsUSGMetrics!.sUSGPrice)

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

  //
  // Handle inputs
  const latestRequestRef = useRef(0)

  const resetAfterDepositSuccess = () => {
    loadOnChainData()
    loadUSGsUSGMetrics()
    setDepositWeiValue(undefined)
    setBorrowWeiValue(undefined)
    setZapValue(undefined)
    setBorrowSliderPercent(0)
    setDepositSliderPercent(0)
    setIsTxLoading(false)
    fetchBalanceAllowanceData(depositAssetInfo?.address)
  }

  function loadDataAfterApprove(assetAddress: Address) {
    loadOnChainData()
    fetchBalanceAllowanceData(assetAddress)
    setIsTxLoading(false)
  }

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)
    setPriceImpact(0)

    if (!value || !depositAssetInfo || !isZapping) {
      if (!value || value === 0n) setZapValue(undefined)
      return
    }

    const requestId = ++latestRequestRef.current
    setIsZapLoading(true)

    getQuote(value, currentAddress || zeroAddress, marketInfo?.collatAddress, depositAssetInfo?.address, curveRoutes)
      .then(({ quote, priceImpact: pI }) => {
        // Do nothing when price is stale
        if (requestId !== latestRequestRef.current) return // stale

        const { validQuote, validPriceImpact } = handleQuote(quote, pI)

        if (validPriceImpact >= 0 && validQuote) {
          setZapValue(validQuote)
          setPriceImpact(Number(validPriceImpact) / 100)
        } else {
          setZapValue(undefined)
        }
      })
      .catch((error) => {
        if (requestId !== latestRequestRef.current) return
        console.error("Error fetching zap value:", error)
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) setIsZapLoading(false)
      })
  }

  const handleZapInputChange = (v: bigint | undefined) => {
    const value = v || 0n
    const zapValueNumber = Number(formatEther(value))
    setZapInnerValue(zapValueNumber)
    setIsZapUserInput(true)
  }

  // ────────────────────────────────────────
  //             USE MEMOS
  // ────────────────────────────────────────

  const maxBorrowableValue = useMemo(() => {
    const deposit = depositWeiValue || 0n

    if (marketData) {
      const futureDebt = marketData?.debtInfos?.userDebt
      let futureDeposited

      if (isZapping) {
        futureDeposited = marketData?.collateralInfos?.positionCollateralUSDValue

        if (zapValue) {
          futureDeposited +=
            (computedMinAmountOut(zapValue, slippage) * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** collateralInfo?.decimals)
        }
      } else {
        futureDeposited =
          marketData?.collateralInfos?.positionCollateralUSDValue + (deposit * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** 18)
      }
      const maxBorrowable = (futureDeposited * marketData?.constants.maxLTV) / 100000n - futureDebt

      const computedMaxBorrowable = computeMaxBorrowable(maxBorrowable, marketData?.constants?.maxMarketDebt, marketData?.debtInfos?.totalDebt)

      return computedMaxBorrowable >= 0n ? computedMaxBorrowable : 0n
    }

    return 0n
  }, [marketData, depositWeiValue, depositAsset, depositAssetInfo, zapValue, slippage, isZapping])

  const zapValuesFormatted = useMemo(() => {
    if (!isZapLoading && zapValue) {
      const minAmountOutWei = computedMinAmountOut(zapValue, slippage)
      const decimals = collateralInfo?.decimals || 18
      const displayDecimals = collateralInfo?.displayDecimals || 2

      return {
        expectedFormatted: `${formatBigInt(zapValue, decimals, displayDecimals)} `,
        minOutFormatted: `${formatBigInt(minAmountOutWei, decimals, displayDecimals)}`,
      }
    }

    return { expectedFormatted: `-`, minOutFormatted: `-` }
  }, [zapValue, isZapLoading, slippage])

  const maxDepositString = useMemo(() => {
    const asset = depositAssetInfo?.symbol?.replaceAll("-", "/")

    if (isConnected) {
      let amountDisplayed = "0"

      if (!!balanceAllowanceData && currentAddress && (isZapping || depositAssetInfo?.address == marketData?.constants?.receipt)) {
        amountDisplayed = formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)
      }
      if (currentAddress && !isZapping) {
        amountDisplayed = formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)
      }
      return `Max ${amountDisplayed} ${asset}`
    }

    return `Max 0 ${asset}`
  }, [currentAddress, depositAssetInfo, balanceAllowanceData, isZapping, isConnected])

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
      isTransactionBlockedByPriceImpact,
      isTransactionBlockedBySlippage,
      marketData,
      depositWeiValue,
      borrowWeiValue,
      zapValue,
      isZapping,
      isDepositAndBorrow,
      isWellConnected,
      balanceAllowanceData!,
      maxBorrowableValue || 0n,
      isZapLoading || isDepositLoading || isTxLoading
    )
  }, [
    isDepositLoading,
    isZapLoading || isDepositLoading || isTxLoading,
    marketData,
    isDepositAndBorrow,
    borrowWeiValue,
    depositWeiValue,
    isWellConnected,
    currentAddress,
    depositAssetInfo,
    balanceAllowanceData,
    isTransactionBlockedByPriceImpact,
    isTransactionBlockedBySlippage,
    zapValue,
    isZapping,
  ])

  //  ACTIONS

  const actionApprove = async () => {
    setIsTxLoading(true)
    if (walletClient && depositWeiValue) {
      try {
        await toastTx(doApprove(walletClient, depositAssetInfo?.address, marketInfo?.marketAddress, depositWeiValue), {
          pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
          success: () => ({
            type: "Success",
            content: `${depositAssetInfo?.symbol} approved successfully.`,
          }),
          error: (err) => {
            const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
            return { type: "Error", content: error || "Unable to proceed with the transaction." }
          },
        })

        // Executed once after the resolve of the toads
        loadDataAfterApprove(depositAssetInfo?.address)
      } catch {
        setIsTxLoading(false)
      }
    }
  }

  const actionDeposit = () => {
    setIsTxLoading(true)

    if (!walletClient || !depositWeiValue || !currentAddress || !depositAssetInfo) {
      toast.error(ToastComponent, { data: { type: "Error", content: "Unable to proceed with the transaction." } })
      setIsTxLoading(false)

      return
    }

    const isReceiptIn = marketData?.constants?.receipt.toLowerCase() === depositAssetInfo?.address.toLowerCase()

    if (isDepositAndBorrow) {
      _depositAndBorrow(isReceiptIn)
    } else {
      _deposit(isReceiptIn)
    }
  }

  const _depositAndBorrow = async (isReceiptIn: boolean) => {
    try {
      await toastTx(
        doMarketDepositAndBorrow(walletClient!, {
          depositWeiValue: depositWeiValue!,
          isDepositAndBorrow,
          marketAddress: marketInfo?.marketAddress,
          borrowWeiValue,
          isReceiptIn,
        }),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: "Position successfully created.",
          }),
          error: (err) => {
            console.error(err)
            const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
            return { type: "Error", content: error || "Unable to proceed with the transaction." }
          },
        }
      )
      resetAfterDepositSuccess()
    } catch {
      setIsTxLoading(false)
    }
  }

  const _deposit = async (isReceiptIn: boolean) => {
    try {
      await toastTx(
        doMarketDeposit(walletClient!, {
          depositWeiValue: depositWeiValue!,
          marketAddress: marketInfo?.marketAddress,
          borrowWeiValue,
          isReceiptIn,
        }),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: "Position successfully created.",
          }),
          error: (err) => {
            const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
            return { type: "Error", content: error || "Unable to proceed with the transaction." }
          },
        }
      )
      resetAfterDepositSuccess()
    } catch {
      setIsTxLoading(false)
    }
  }

  const getRouteAndDeposit = async () => {
    if (!depositWeiValue || !currentAddress || !depositAssetInfo) return

    if (isDepositAndBorrow) {
      _zapAndDepositAndBorrow()
    } else {
      _zapAndDeposit()
    }
  }

  const _zapAndDepositAndBorrow = async () => {
    if (!depositWeiValue || !currentAddress || !depositAssetInfo || !borrowWeiValue || !zapValue) return

    setIsTxLoading(true)
    const minOut = computedMinAmountOut(zapValue, slippage)

    try {
      const zapData = await getRoute(
        depositAssetInfo?.address,
        collateralInfo!.address,
        depositWeiValue,
        minOut,
        marketInfo?.marketAddress,
        currentAddress,
        curveRoutes
      )

      const zapMarketData = {
        tokenIn: depositAssetInfo?.address,
        amountIn: depositWeiValue,
        minAmountOut: minOut,
      }

      await toastTx(
        doZapDepositAndBorrow(marketInfo?.marketAddress, walletClient!, zapData?.routerAddress, zapData?.data as string, zapMarketData, borrowWeiValue),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: "Position successfully created.",
          }),
          error: (err) => {
            const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
            return { type: "Error", content: error || "Unable to proceed with the transaction." }
          },
        }
      )
      resetAfterDepositSuccess()
    } catch (err) {
      console.error("ERROR : ", err)
      setIsTxLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Something went wrong." } })
    }
  }

  const _zapAndDeposit = async () => {
    if (!depositWeiValue || !currentAddress || !depositAssetInfo || !zapValue) return

    setIsTxLoading(true)
    const minOut = computedMinAmountOut(zapValue, slippage)

    try {
      const zapData = await getRoute(
        depositAssetInfo?.address,
        collateralInfo?.address,
        depositWeiValue,
        minOut,
        marketInfo?.marketAddress,
        currentAddress,
        curveRoutes
      )

      const zapMarketData = {
        tokenIn: depositAssetInfo?.address,
        amountIn: depositWeiValue,
        minAmountOut: minOut,
      }

      await toastTx(doZapDeposit(marketInfo?.marketAddress, walletClient!, zapData?.routerAddress, zapData?.data as string, zapMarketData), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({
          type: "Success",
          content: "Position successfully created.",
        }),
        error: (err) => {
          const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
          return { type: "Error", content: error || "Unable to proceed with the transaction." }
        },
      })
      resetAfterDepositSuccess()
    } catch (err) {
      console.error("ERROR : ", err)
      setIsTxLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Something went wrong." } })
    }
  }

  const priceImpactLoss = useMemo(() => {
    const { dollarLoss } = computeTransactionPotentialLoss(zapValue as bigint, collateralInfo, priceImpact)

    return dollarLoss
  }, [zapValue, priceImpact])

  const slippageLoss = useMemo(() => {
    const { tokenLoss, dollarLoss } = computeTransactionPotentialLoss(zapValue as bigint, collateralInfo, slippage)

    return { tokenLoss, dollarLoss }
  }, [slippage, zapValue])

  useEffect(() => {
    setIsTransactionBlockedBySlippage(!!depositWeiValue && !!zapValue && slippage >= 1)
  }, [slippage, zapValue, depositWeiValue])

  useEffect(() => {
    setIsTransactionBlockedByPriceImpact(!!depositWeiValue && !!zapValue && priceImpact >= 1)
  }, [priceImpact, zapValue, depositWeiValue])

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

    slippageLoss,

    isTransactionBlockedBySlippage,
    setIsTransactionBlockedBySlippage,

    priceImpactLoss,

    priceImpact,

    isTransactionBlockedByPriceImpact,
    setIsTransactionBlockedByPriceImpact,
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
