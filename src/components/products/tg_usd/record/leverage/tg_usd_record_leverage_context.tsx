"use client"

import { ZapToken } from "../../tg_usd_type"
import { AssetDataPriced, CollateralInfo, FormState } from "@/types"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { formatUnits, parseEther } from "viem"
import { useTgUsdContext } from "../../tg_usd_context"
import { getQuote, returnRoute } from "../../global_quote_controller"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"
import { doMarketLeverage, doZapLeverage, getLeverageFormState } from "./tg_usd_record_leverage_controller"
import { computeSwapAssetPrice, doApprove } from "../tg_usd_record_controller"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"
import { formatDollar, formatNumber } from "@/lib/number_formatter"

type TgUsdLeverageContextProps = {
  children: ReactNode
}

type TgUsdLeverageContextValues = {
  collateralInfo: AssetDataPriced
  isStaking: boolean
  setIsStaking: (arg: boolean) => void

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

  sociabilizationFee: number | null

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
}

export const TgUsdLeverageContext = createContext<TgUsdLeverageContextValues | undefined>(undefined)

export const TgUsdLeverageProvider = ({ children }: TgUsdLeverageContextProps) => {
  const { tokens } = useTgUsdContext()

  const { marketData, loadOnChainData, setCurrentAmounts, balanceAllowanceData, fetchBalanceAllowanceData, collateralInfo, marketInfo } =
    useTgUsdRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isStaking, setIsStaking] = useState<boolean>(true)

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

  const [slippage, setSlippage] = useState<number>(10)

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

  const sociabilizationFee = useMemo(() => {
    if (marketData?.sociabilization && depositWeiValue && depositAssetInfo) {
      return Number(formatUnits(marketData?.sociabilization?.socFeePercentage, 7)) * Number(formatUnits(depositWeiValue, depositAssetInfo?.decimals))
    }
    return 0
  }, [marketData, depositWeiValue, depositAssetInfo])

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !currentAddress || !depositAssetInfo) return

      setIsZapLoading(true)
      try {
        const { quote } = await getQuote(value, currentAddress, marketInfo?.collatAddress, depositAssetInfo?.address)

        if (quote) {
          setZapValue(quote as bigint)
        }
      } catch (error) {
        console.error("Error fetching zap value:", error)
      } finally {
        setIsZapLoading(false)
      }
    }

    fetchZapValue()
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
        const { quote } = await getQuote(parseEther(e?.target?.value), currentAddress, depositAssetInfo?.address, marketInfo?.collatAddress)

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
    setZapValue(0n)
  }, [depositAsset])

  useEffect(() => {
    setCurrentAmounts({
      depositWeiValue: (depositWeiValue || 0n) + (leveragedCollateralQuote || 0n),
      borrowWeiValue: borrowWeiValue || 0n,
      zapValue: !!zapValue ? (BigInt(zapValue) || 0n) + (leveragedCollateralQuote || 0n) : 0n,
    })
  }, [depositWeiValue, borrowWeiValue, zapValue, leveragedCollateralQuote])

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
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue)
      doApprove(walletClient, marketInfo?.collatAddress, marketInfo?.marketAddress, depositWeiValue).then(() => {
        loadOnChainData()
        setIsDepositLoading(false)
        fetchBalanceAllowanceData(depositAssetInfo?.address)
      })
  }

  const actionZapLeverage = async () => {
    try {
      const walletClient = getWalletClient()

      loadOnChainData()
      if (!walletClient || !currentAddress || !depositWeiValue || !borrowWeiValue || !depositAssetInfo) return

      const leverageData = await returnRoute(
        TGUSD_CONTRACT.USG,
        marketInfo?.collatAddress,
        borrowWeiValue,
        (BigInt(leveragedCollateralQuote!) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        marketInfo?.marketAddress,
        TGUSD_CONTRACT.ZAPPER
      )

      const zapData = await returnRoute(
        depositAssetInfo?.address,
        marketInfo?.collatAddress,
        depositWeiValue,
        (BigInt(zapValue!) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        marketInfo?.marketAddress,
        currentAddress!,
        currentAddress!
      )

      doZapLeverage(
        borrowWeiValue,
        (BigInt(leveragedCollateralQuote!) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        isStaking,
        leverageData!,
        depositAssetInfo?.address,
        depositWeiValue,
        (BigInt(zapValue!) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        zapData!,
        walletClient,
        marketInfo?.marketAddress
      )
        .then(() => {
          loadOnChainData()
          setLeveragedCollateralQuote(0n)
          setBorrowWeiValue(0n)
          setDepositWeiValue(undefined)
          setDepositSliderPercent(0)
          setLeveragePercentage(0)
          setZapValue(null)

          toast.success(ToastComponent, { data: { type: "Success", content: "Position successfully created." } })
          setIsDepositLoading(false)
        })
        .catch((err) => {
          console.error("ERROR : ", err)
          toast.error(ToastComponent, { data: { type: "Error", content: "Something went wrong." } })
        })
    } catch {
      toast.error(ToastComponent, { data: { type: "Error", content: "Something went wrong." } })
    }
  }

  const actionLeverage = async () => {
    const walletClient = getWalletClient()

    loadOnChainData()
    if (!walletClient || !currentAddress || !leveragedCollateralQuote || !borrowWeiValue) return

    const leverageData = await returnRoute(
      TGUSD_CONTRACT.USG,
      marketInfo?.collatAddress,
      borrowWeiValue,
      leveragedCollateralQuote,
      marketInfo?.marketAddress,
      TGUSD_CONTRACT.ZAPPER
    )

    doMarketLeverage(marketInfo?.marketAddress, walletClient, depositWeiValue || 0n, borrowWeiValue, leveragedCollateralQuote, isStaking, leverageData!)
      .then(() => {
        loadOnChainData()
        setDepositWeiValue(0n)
        setBorrowWeiValue(0n)
        setLeveragedCollateralQuote(0n)
        setDepositSliderPercent(0)
        setIsDepositLoading(false)
        toast.success(ToastComponent, { data: { type: "Success", content: "Position successfully created." } })
      })
      .catch((err) => {
        console.error("ERROR : ", err)
      })
  }

  const formState = useMemo(
    () =>
      getLeverageFormState(
        marketData,
        depositWeiValue,
        borrowWeiValue,
        isDepositDisabled,
        isWellConnected,
        depositAssetInfo!,
        collateralInfo!,
        balanceAllowanceData!,
        isDepositLoading
      ),
    [marketData, isDepositDisabled, borrowWeiValue, depositWeiValue, isWellConnected, currentAddress, depositAssetInfo, balanceAllowanceData, isDepositLoading]
  )

  useEffect(() => {
    if (depositAssetInfo) {
      fetchBalanceAllowanceData(depositAssetInfo?.address)
    }
  }, [depositAssetInfo])

  useEffect(() => {
    const computeQuote = async (value: bigint) => {
      const { quote } = await getQuote(value, currentAddress!, marketInfo?.collatAddress, TGUSD_CONTRACT.USG)

      setIsDepositLoading(false)
      setLeveragedCollateralQuote(quote)
    }

    if (borrowWeiValue) {
      setIsDepositLoading(true)
      computeQuote(borrowWeiValue)
    }
  }, [borrowWeiValue])

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

  const quoteDetail = useMemo(() => {
    if (!!zapValue) {
      const sum = ` ${formatNumber(Number(formatUnits(zapValue || 0n, 18)), 0)} + ${formatNumber(Number(formatUnits(leveragedCollateralQuote || 0n, 18)), 0)}  ~= `
      const result = `${formatNumber(Number(formatUnits((leveragedCollateralQuote || 0n) + BigInt(zapValue || 0n), 18)), 0)}  ${collateralInfo?.symbol}`

      return { sum, result }
    } else if (!zapValue && !!depositWeiValue) {
      const sum = ` ${formatNumber(Number(formatUnits(depositWeiValue || 0n, 18)), 0)} + ${formatNumber(Number(formatUnits(leveragedCollateralQuote || 0n, 18)), 0)}  ~= `
      const result = `${formatNumber(Number(formatUnits((leveragedCollateralQuote || 0n) + (depositWeiValue || 0n), 18)), 0)}  ${collateralInfo?.symbol}`

      return { sum, result }
    } else {
      return { sum: "", result: `0 ${collateralInfo?.symbol}` }
    }
  }, [depositWeiValue, leveragedCollateralQuote, zapValue])

  const estimatedZapDollarValue = useMemo(() => {
    if (zapValue && marketData) {
      const result = `~(${formatDollar(formatUnits((BigInt(zapValue) * marketData?.collateralInfos?.collateralUSDPrice) / BigInt(10 ** 18), 18))})`
      return result
    }

    return ""
  }, [zapValue])

  const contextValue: TgUsdLeverageContextValues = {
    collateralInfo,
    isStaking,
    setIsStaking,
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

    sociabilizationFee,

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
  }

  return <TgUsdLeverageContext.Provider value={contextValue}>{children}</TgUsdLeverageContext.Provider>
}

export const useTgUsdLeverageContext = () => {
  const context = useContext(TgUsdLeverageContext)
  if (!context) {
    throw new Error("useTgUsdLeverageContext must be used within a TgUsdLeverageProvider")
  }
  return context
}
