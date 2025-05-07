"use client"

import { TgUsdMarket, ZapToken } from "../../tg_usd_type"
import { AssetDataPriced, FormState } from "@/types"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { EstimateContractGasParameters, formatUnits } from "viem"
import { gasCostToUSD, getPublicClient } from "@/services/service_rpc"
import { useTgUsdContext } from "../../tg_usd_context"
import { returnEnsoQuote, returnRoute } from "../../global_quote_controller"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"
import {
  doApproveMarketDeposit,
  doApproveZapLeverage,
  doMarketLeverage,
  doZapLeverage,
  getLeverageFormState,
  prepareZapTransaction,
} from "./tg_usd_record_leverage_controller"
import { computeSwapAssetPrice } from "../tg_usd_record_controller"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"

type TgUsdLeverageContextProps = {
  children: ReactNode
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
}

type TgUsdLeverageContextValues = {
  marketInfo: TgUsdMarket
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
  depositAssetInfo: AssetDataPriced | null

  slippage: number
  setSlippage: (arg: number) => void
  gas: number | null
  sociabilizationFee: number | null

  zapInnerValue: number | undefined
  setZapInnerValue: (arg: number | undefined) => void

  depositSliderPercent: number
  setDepositSliderPercent: (arg: number) => void

  leveragePercentage: number
  setLeveragePercentage: (arg: number) => void

  borrowSliderPercent: number
  setBorrowSliderPercent: (arg: number) => void

  handleZapInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  actionLeverage: () => void

  actionZapLeverage: () => void

  leveragedCollateralQuote: bigint | undefined
  setLeveragedCollateralQuote: (arg: bigint) => void
}

export const TgUsdLeverageContext = createContext<TgUsdLeverageContextValues | undefined>(undefined)

export const TgUsdLeverageProvider = ({ children, collateralInfo, marketInfo }: TgUsdLeverageContextProps) => {
  const { tokens } = useTgUsdContext()

  const { marketData, loadOnChainData, setCurrentAmounts, balanceAllowanceData, fetchBalanceAllowanceData } = useTgUsdRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [isStaking, setIsStaking] = useState<boolean>(false)

  const [isDepositDisabled, setIsDepositDisabled] = useState<boolean>(false)

  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()

  const [depositAsset, setDepositAsset] = useState<string | undefined>(undefined)
  const [swapAssetPrice, setSwapAssetPrice] = useState<number | null>(null)

  const [borrowSliderPercent, setBorrowSliderPercent] = useState<number>(0)

  const [leveragePercentage, setLeveragePercentage] = useState<number>(1)

  const [depositSliderPercent, setDepositSliderPercent] = useState<number>(0)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()
  const [isDepositLoading, setIsDepositLoading] = useState(false)

  const [isZapLoading, setIsZapLoading] = useState(false)
  const [zapValue, setZapValue] = useState<bigint | null>(null)

  const [zapInnerValue, setZapInnerValue] = useState<number | undefined>(zapValue !== undefined ? Number(formatUnits(zapValue || BigInt(0), 18)) : undefined)

  const [leveragedCollateralQuote, setLeveragedCollateralQuote] = useState<bigint | undefined>()

  //
  const [slippage, setSlippage] = useState<number>(10)
  // TODO replace with a lower slippage by default

  const [gas, setGas] = useState<number | null>(null)

  const depositAssetInfo = useMemo(() => {
    if (depositAsset === "ETH") {
      return {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        displayDecimals: 5,
        symbol: "ETH",
        name: "ETH",
        price: swapAssetPrice,
      } as AssetDataPriced
    }

    const assetInfo = tokens.find((el: ZapToken) => el.name === depositAsset || el.symbol === depositAsset) || undefined

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
  }, [depositAsset, swapAssetPrice])

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
        const { quote } = await returnEnsoQuote(value, currentAddress, collateralInfo?.address, depositAssetInfo?.address, slippage)

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

  const handleZapInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    setZapInnerValue(value)
  }

  useEffect(() => {
    if (!depositAsset) return

    const fetchSwapAssetData = async () => {
      setIsZapLoading(true)
      try {
        const data = await computeSwapAssetPrice(tokens, depositAsset)
        setSwapAssetPrice(data)
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

    await doApproveZapLeverage(walletClient, depositAssetInfo?.address, depositWeiValue || 0n, marketInfo?.marketAddress)
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
      doApproveMarketDeposit(walletClient, collateralInfo?.address, {
        marketAddress: marketInfo?.marketAddress,
        depositWeiValue,
      }).then(() => {
        loadOnChainData()
        setIsDepositLoading(false)
      })
  }

  const actionZapLeverage = async () => {
    const walletClient = getWalletClient()

    loadOnChainData()
    if (!walletClient || !currentAddress || !depositWeiValue || !borrowWeiValue || !depositAssetInfo) return

    const leverageData = await returnRoute(TGUSD_CONTRACT.TG_USD, collateralInfo?.address, borrowWeiValue, 0n, marketInfo?.marketAddress, TGUSD_CONTRACT.ZAPPER)

    const zapData = await returnRoute(
      depositAssetInfo?.address,
      collateralInfo?.address,
      depositWeiValue,
      0n,
      marketInfo?.marketAddress,
      currentAddress!,
      currentAddress!
    )

    doZapLeverage(
      borrowWeiValue,
      0n,
      isStaking,
      leverageData!,
      depositAssetInfo?.address,
      depositWeiValue,
      0n,
      zapData!,
      walletClient,
      marketInfo?.marketAddress
    )
      .then(() => {
        loadOnChainData()
        setDepositWeiValue(0n)
        setBorrowWeiValue(0n)
        setBorrowSliderPercent(0)
        setDepositSliderPercent(0)
        setZapValue(0n)
        setIsDepositLoading(false)
        toast.success(ToastComponent, { data: { type: "Success", content: "Position successfully created." } })
      })
      .catch((err) => {
        console.error("ERROR : ", err)
      })
  }

  const actionLeverage = async () => {
    const walletClient = getWalletClient()

    loadOnChainData()
    if (!walletClient || !currentAddress || !leveragedCollateralQuote || !borrowWeiValue) return

    const leverageData = await returnRoute(TGUSD_CONTRACT.TG_USD, collateralInfo?.address, borrowWeiValue, 0n, marketInfo?.marketAddress, TGUSD_CONTRACT.ZAPPER)

    doMarketLeverage(marketInfo?.marketAddress, walletClient, depositWeiValue || 0n, borrowWeiValue, 0n, isStaking, leverageData!)
      .then(() => {
        loadOnChainData()
        setDepositWeiValue(0n)
        setBorrowWeiValue(0n)
        setBorrowSliderPercent(0)
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

  const computeGas = async () => {
    try {
      const { routerCallData, zapMarketData } = await prepareZapTransaction(depositWeiValue!, collateralInfo, depositAssetInfo!, marketInfo, slippage)

      const walletClient = getWalletClient()

      const [account] = await walletClient!.requestAddresses()

      let estimateGasData

      if (!!borrowWeiValue) {
        estimateGasData = {
          abi: MarketExternalActions.abi,
          functionName: "zapDepositAndBorrow",
          args: [
            borrowWeiValue,
            isStaking,
            {
              tokenIn: zapMarketData?.tokenIn,
              amountIn: zapMarketData?.amountIn,
              minAmountOut: zapMarketData?.minAmountOut,
              zap: { router: routerCallData?.tx?.to, routerCall: routerCallData?.tx?.data },
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
            isStaking,
            {
              tokenIn: zapMarketData?.tokenIn,
              amountIn: zapMarketData?.amountIn,
              minAmountOut: zapMarketData?.minAmountOut,
              zap: { router: routerCallData?.tx?.to, routerCall: routerCallData?.tx?.data },
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

      const publicClient = await getPublicClient()
      const gasData = await publicClient.estimateContractGas(estimateGasData)
      const gasInUsd = await gasCostToUSD(gasData)
      setGas(gasInUsd)
    } catch (error) {
      console.error("Error in computeGas:", error)
    }
  }

  useEffect(() => {
    if (!!depositWeiValue && !!zapValue && !!depositAssetInfo && !!currentAddress && !formState?.haveToApprove && !isZapLoading && !isDepositLoading) {
      computeGas()
    }
  }, [depositWeiValue, zapValue, formState, isZapLoading, isDepositLoading])

  useEffect(() => {
    const computeQuote = async (value: bigint) => {
      const { quote } = await returnEnsoQuote(value, currentAddress!, collateralInfo?.address, TGUSD_CONTRACT.TG_USD, slippage)

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
      const updatedValue = Number(Number(formatUnits(zapValue || 0n, 18)).toFixed(2))
      setZapInnerValue(updatedValue)
    } else {
      setZapInnerValue(undefined)
    }
  }, [zapValue])

  const contextValue: TgUsdLeverageContextValues = {
    marketInfo,
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
    gas,
    sociabilizationFee,

    depositSliderPercent,
    setDepositSliderPercent,

    borrowSliderPercent,
    setBorrowSliderPercent,

    leveragePercentage,
    setLeveragePercentage,

    leveragedCollateralQuote,
    setLeveragedCollateralQuote,

    handleZapInputChange,

    zapInnerValue,
    setZapInnerValue,

    actionZapLeverage,

    actionApproveZap,
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
