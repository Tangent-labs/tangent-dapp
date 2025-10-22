"use client"

import { toast } from "react-toastify"
import { useUSGContext } from "../../tg_usd_context"
import { USGMarket, ZapToken } from "../../tg_usd_type"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { ToastComponent } from "@/components/design_system/toast"
import { getQuote, getRoute } from "../../global_quote_controller"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import { AssetDataPriced, CollateralInfo, FormState } from "@/types"
import { gasCostToUSD, getPublicClient } from "@/services/service_rpc"
import { useRootContext } from "@/components/products/root/root_context"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { EstimateContractGasParameters, formatUnits, parseEther, zeroAddress } from "viem"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { computeMaxBorrowable, computeSwapAssetPrice, doApprove } from "../tg_usd_record_controller"
import { doZapDeposit, doZapDepositAndBorrow, getDepositFormState, doMarketDeposit } from "./usg_record_deposit_controller"

type USGDepositContextProps = {
  children: ReactNode
}

type USGDepositContextValues = {
  marketInfo: USGMarket
  collateralInfo: CollateralInfo
  isDepositAndBorrow: boolean
  setIsDepositAndBorrow: (arg: boolean) => void
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
  gas: number | null

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
}

export const USGDepositContext = createContext<USGDepositContextValues | undefined>(undefined)

export const USGDepositProvider = ({ children }: USGDepositContextProps) => {
  const { curveRoutes } = useRootContext()

  const { tokens, loadUSGsUSGMetrics } = useUSGContext()

  const { marketData, loadOnChainData, setCurrentAmounts, balanceAllowanceData, fetchBalanceAllowanceData, collateralInfo, marketInfo } = useUSGRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isDepositAndBorrow, setIsDepositAndBorrow] = useState<boolean>(false)

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

  const [slippage, setSlippage] = useState<number>(1)

  const [gas, setGas] = useState<number | null>(null)

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

        if (quote) {
          setZapValue(quote)
        }
      } catch (error) {
        console.error("Error fetching zap value:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    if (!!depositAssetInfo && !!collateralInfo && depositAssetInfo?.address !== collateralInfo?.address) {
      fetchZapValue()
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

        setDepositWeiValue(quote)
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
    setCurrentAmounts({
      depositWeiValue: depositWeiValue || 0n,
      borrowWeiValue: borrowWeiValue || 0n,
      zapValue: zapValue || 0n,
    })
  }, [depositWeiValue, borrowWeiValue, zapValue])

  const actionApproveZap = async () => {
    setIsDepositLoading(true)
    const walletClient = getWalletClient()
    if (!walletClient || !depositAssetInfo) {
      console.error("Wallet client is not available.")
      return
    }

    await doApprove(walletClient, depositAssetInfo?.address, marketInfo?.marketAddress, depositWeiValue || 0n)
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
        fetchBalanceAllowanceData(depositAssetInfo?.address)
        loadOnChainData()
        setIsDepositLoading(false)
      })
  }

  const actionDeposit = () => {
    setIsDepositLoading(true)
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue) {
      doMarketDeposit(walletClient, { depositWeiValue, isDepositAndBorrow, marketAddress: marketInfo?.marketAddress, borrowWeiValue })
        .then(() => {
          resetAfterDepositSuccess()
          toast.success(ToastComponent, { data: { type: "Success", content: "Position successfully created." } })
        })
        .catch(() => {
          setIsDepositLoading(false)
          toast.error(ToastComponent, { data: { type: "Error", content: "Unable to proceed with the transaction." } })
        })
    } else {
      setIsDepositLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Unable to proceed with the transaction." } })
    }
  }

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
        isDepositLoading
      ),
    [marketData, isDepositAndBorrow, borrowWeiValue, depositWeiValue, isWellConnected, currentAddress, depositAssetInfo, balanceAllowanceData, isDepositLoading]
  )

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

  const computeGas = async () => {
    try {
      const zapData = await getRoute(
        depositAssetInfo?.address,
        collateralInfo?.address,
        depositWeiValue!,
        (BigInt(zapValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        marketInfo.marketAddress,
        currentAddress!,
        curveRoutes
      )

      const zapMarketData = {
        tokenIn: depositAssetInfo?.address,
        amountIn: depositWeiValue!,
        minAmountOut: (BigInt(zapValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
      }

      const walletClient = getWalletClient()

      const [account] = await walletClient!.requestAddresses()

      let estimateGasData

      if (!!borrowWeiValue) {
        estimateGasData = {
          abi: MarketExternalActions.abi,
          functionName: "zapDepositAndBorrow",
          args: [
            borrowWeiValue,
            {
              tokenIn: zapMarketData?.tokenIn,
              amountIn: zapMarketData?.amountIn,
              minAmountOut: zapMarketData?.minAmountOut,
              zap: { router: zapData?.routerAddress, routerCall: zapData?.data },
            },
          ] as unknown[],
          address: marketInfo?.marketAddress,
          account,
          value: 0n,
        } as EstimateContractGasParameters
      } else {
        estimateGasData = {
          abi: MarketExternalActions.abi,
          functionName: "zapDeposit",
          args: [
            account,
            {
              tokenIn: zapMarketData?.tokenIn,
              amountIn: zapMarketData?.amountIn,
              minAmountOut: zapMarketData?.minAmountOut,
              zap: { router: zapData?.routerAddress, routerCall: zapData?.data },
            },
          ] as unknown[],
          address: marketInfo?.marketAddress,
          account,
          value: 0n,
        } as EstimateContractGasParameters
      }

      if (zapMarketData?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        estimateGasData.value = zapMarketData?.amountIn
      }

      const publicClient = getPublicClient()
      const gasData = await publicClient.estimateContractGas(estimateGasData)
      const gasInUsd = await gasCostToUSD(gasData)
      setGas(gasInUsd)
    } catch (error) {
      console.error("Error in computeGas:", error)
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
    if (!depositWeiValue || !currentAddress || !depositAssetInfo || !borrowWeiValue) return

    setIsZapLoading(true)
    setIsDepositLoading(true)

    try {
      const zapData = await getRoute(
        depositAssetInfo?.address,
        collateralInfo?.address,
        depositWeiValue,
        (BigInt(zapValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        marketInfo?.marketAddress,
        currentAddress,
        curveRoutes
      )

      const zapMarketData = {
        tokenIn: depositAssetInfo?.address,
        amountIn: depositWeiValue,
        minAmountOut: (BigInt(zapValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
      }

      const walletClient = getWalletClient()

      doZapDepositAndBorrow(marketInfo?.marketAddress, walletClient!, zapData?.routerAddress, zapData?.data as string, zapMarketData, borrowWeiValue)
        .then(() => {
          resetAfterDepositSuccess()
          toast.success(ToastComponent, { data: { type: "Success", content: "Position successfully created." } })
        })
        .catch(() => {
          setIsZapLoading(false)
          setIsDepositLoading(false)
          toast.error(ToastComponent, { data: { type: "Error", content: "Unable to proceed with the transaction." } })
        })
    } catch (error) {
      console.error("Error in getRouteAndDeposit:", error)
    }
  }

  const zapAndDeposit = async () => {
    if (!depositWeiValue || !currentAddress || !depositAssetInfo) return

    setIsZapLoading(true)
    setIsDepositLoading(true)

    try {
      const zapData = await getRoute(
        depositAssetInfo?.address,
        collateralInfo?.address,
        depositWeiValue,
        (BigInt(zapValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        marketInfo?.marketAddress,
        currentAddress,
        curveRoutes
      )

      const zapMarketData = {
        tokenIn: depositAssetInfo?.address,
        amountIn: depositWeiValue,
        minAmountOut: (BigInt(zapValue || 0n) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
      }

      const walletClient = getWalletClient()

      doZapDeposit(marketInfo?.marketAddress, walletClient!, zapData?.routerAddress, zapData?.data as string, zapMarketData)
        .then(() => {
          resetAfterDepositSuccess()
          toast.success(ToastComponent, { data: { type: "Success", content: "Position successfully created." } })
        })
        .catch(() => {
          setIsZapLoading(false)
          setIsDepositLoading(false)
          toast.error(ToastComponent, { data: { type: "Error", content: "Unable to proceed with the transaction." } })
        })
    } catch (error) {
      console.error("Error in zapAndDeposit:", error)
      setIsZapLoading(false)
      setIsDepositLoading(false)
      toast.error(ToastComponent, { data: { type: "Error", content: "Transation failed." } })
    }
  }

  useEffect(() => {
    if (!!depositWeiValue && !!zapValue && !!depositAssetInfo && !!currentAddress && !formState?.haveToApprove && !isZapLoading && !isDepositLoading) {
      computeGas()
    }
  }, [depositWeiValue, zapValue, formState, isZapLoading, isDepositLoading])

  const maxBorrowableValue = useMemo(() => {
    const deposit = depositWeiValue || 0n

    if (marketData) {
      const futureDebt = marketData?.debtInfos?.userDebt
      let futureDeposited

      if (depositAsset && depositAsset !== collateralInfo?.symbol) {
        futureDeposited =
          marketData?.collateralInfos?.positionCollateralUSDValue +
          (BigInt(zapValue || 0n) * BigInt(1000000 - Math.round(slippage * 10000)) * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** 24)
      } else {
        futureDeposited =
          marketData?.collateralInfos?.positionCollateralUSDValue + (deposit * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** 18)
      }
      const maxBorrowable = (futureDeposited * marketData?.constants.maxLTV) / 100000n - futureDebt

      const computedMaxBorrowable = computeMaxBorrowable(maxBorrowable, marketData?.constants?.maxMarketDebt, marketData?.debtInfos?.totalDebt)

      return computedMaxBorrowable
    }

    return 0n
  }, [marketData, depositWeiValue, depositAsset, depositAssetInfo, zapValue, slippage])

  const estimatedZapDollarValue = useMemo(() => {
    if (zapValue && marketData) {
      const result = `~(${formatDollar(formatUnits((BigInt(zapValue) * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** 18), 18))})`
      return result
    }

    return ""
  }, [zapValue])

  const maxDepositString = useMemo(() => {
    if (!!balanceAllowanceData && currentAddress && depositAsset !== collateralInfo?.name) {
      return `Max ${formatBigInt(balanceAllowanceData?.balance, depositAssetInfo?.decimals, 2)}  ${depositAssetInfo?.symbol}`
    }
    if (currentAddress && depositAsset === collateralInfo?.name) {
      return `Max ${formatBigInt(marketData?.collateralBalance, depositAssetInfo?.decimals, 2)} ${depositAssetInfo?.symbol}`
    }
    return `Max 0 ${depositAssetInfo?.symbol}`
  }, [depositAsset, collateralInfo, currentAddress, depositAssetInfo, balanceAllowanceData])

  const contextValue: USGDepositContextValues = {
    marketInfo,
    collateralInfo,
    isDepositAndBorrow,
    setIsDepositAndBorrow,
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
    gas,

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
