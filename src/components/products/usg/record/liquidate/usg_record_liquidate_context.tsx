"use client"

import { AssetDataPriced, FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useUSGRecordContext } from "../usg_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketLiquidate, getLiquidateFormState } from "./usg_record_liquidate_controller"
import { USG_CONTRACT } from "../../usg_repository"
import { getQuote, getRoute } from "../../global_quote_controller"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"
import { maxUint256 } from "viem"
import { useUSGContext } from "../../usg_context"
import { useRootContext } from "@/components/products/root/root_context"
import { formatBigInt } from "@/lib/number_formatter"
import { computedMinAmountOut } from "../usg_record_controller"

type USGLiquidateContextProps = {
  children: ReactNode
}

type USGLiquidateContextValues = {
  actionLiquidate: () => void
  formState: FormState
  liquidateWeiValue?: bigint
  setLiquidateWeiValue: (arg: bigint | undefined) => void
  isFullLiquidation: boolean
  setIsFullLiquidation: (arg: boolean) => void

  maxLiquidable: bigint
  liquidablePercentage: number
  setLiquidablePercentage: (arg: number) => void

  isQuoteLoading: boolean
  setIsQuoteLoading: (arg: boolean) => void

  USGReceivedValue: bigint | undefined
  setUSGReceivedValue: (arg: bigint | undefined) => void

  repayWeiValue?: bigint
  setRepayWeiValue: (arg: bigint | undefined) => void

  repayablePercentage: number
  setRepayablePercentage: (arg: number) => void

  slippage: number
  setSlippage: (arg: number) => void

  maxRepayable: bigint

  handleLiquidateValueChange: (arg: bigint | undefined) => void

  maxLiquidateString: string
}

export const USGLiquidateContext = createContext<USGLiquidateContextValues | undefined>(undefined)

export const USGLiquidateProvider = ({ children }: USGLiquidateContextProps) => {
  const { loadUSGsUSGMetrics } = useUSGContext()

  const { curveRoutes, handleQuote } = useRootContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, marketInfo, loadOnChainData, marketDisplayData, setCurrentAmounts } = useUSGRecordContext()

  const [liquidablePercentage, setLiquidablePercentage] = useState<number>(0)

  const [repayablePercentage, setRepayablePercentage] = useState<number>(0)

  const [slippage, setSlippage] = useState<number>(0.2)

  const [isQuoteLoading, setIsQuoteLoading] = useState<boolean>(false)

  const [isFullLiquidation, setIsFullLiquidation] = useState<boolean>(false)

  const [liquidateWeiValue, setLiquidateWeiValue] = useState<bigint | undefined>()

  const [repayWeiValue, setRepayWeiValue] = useState<bigint | undefined>()

  const [USGReceivedValue, setUSGReceivedValue] = useState<bigint | undefined>()

  useEffect(() => {
    if (isFullLiquidation) {
      setRepayWeiValue(marketData?.debtInfos?.userDebt)
      handleLiquidateValueChange(marketData?.collateralInfos?.positionCollateralAmount)
    } else {
      setLiquidateWeiValue(0n)
      setRepayWeiValue(0n)
      setUSGReceivedValue(0n)
      setIsQuoteLoading(false)
    }
  }, [isFullLiquidation])

  useEffect(() => {
    setCurrentAmounts({
      liquidateValue: liquidateWeiValue || 0n,
      repayWeiValue: repayWeiValue || 0n,
    })
  }, [liquidateWeiValue, repayWeiValue])

  const actionLiquidate = async () => {
    const walletClient = getWalletClient()

    if (walletClient && liquidateWeiValue && currentAddress && USGReceivedValue && marketData) {
      let repayValue = repayWeiValue || 0n

      // TODO : Change this into a logical value
      const maxUSGToBurn = maxUint256

      if (repayWeiValue === maxRepayable && repayWeiValue !== 0n) {
        repayValue = maxUint256
      }

      const liquidationData = await getRoute(
        marketInfo?.collatAddress,
        USG_CONTRACT.USG,
        liquidateWeiValue,
        computedMinAmountOut(USGReceivedValue, slippage),
        currentAddress,
        USG_CONTRACT.LIQUIDATOR_PROXY,
        curveRoutes
      )

      doMarketLiquidate(
        liquidateWeiValue,
        repayValue,
        maxUSGToBurn,
        computedMinAmountOut(USGReceivedValue, slippage),
        false,
        liquidationData!,
        walletClient,
        marketInfo?.marketAddress
      )
        .then(() => {
          toast.success(ToastComponent, { data: { type: "Success", content: "Transaction successful." } })
          loadUSGsUSGMetrics()
          loadOnChainData()
          setLiquidateWeiValue(0n)
          setLiquidablePercentage(0)
          setRepayWeiValue(0n)
          setUSGReceivedValue(0n)
        })
        .catch((e) => {
          console.error(e)
          toast.error(ToastComponent, { data: { type: "Error", content: "Something wrong happened" } })
        })
    }
  }

  const formState = useMemo(() => {
    if (marketData) {
      return getLiquidateFormState(marketData, liquidateWeiValue!, repayWeiValue || 0n, isWellConnected, isQuoteLoading)
    }
    return { canProcess: false, cantProcessReasons: [], haveToApprove: false }
  }, [marketData, liquidateWeiValue, isWellConnected, currentAddress, isQuoteLoading, repayWeiValue])

  const maxLiquidable = useMemo(() => {
    if (marketData) {
      return marketData.collateralInfos.positionCollateralAmount
    }
    return 0n
  }, [marketDisplayData, repayWeiValue])

  const maxRepayable = useMemo(() => {
    if (marketData) {
      return marketData.debtInfos.userDebt
    }
    return 0n
  }, [marketDisplayData])

  const handleLiquidateValueChange = (value: bigint | undefined) => {
    setIsQuoteLoading(true)
    const assetInfo: AssetDataPriced = {
      address: USG_CONTRACT.USG,
      decimals: 18,
      displayDecimals: 2,
      logo: "USG",
      name: "USG",
      price: 1,
      symbol: "USG",
    }

    setLiquidateWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !currentAddress || !marketData) return

      try {
        const { quote } = await getQuote(value, currentAddress, assetInfo?.address, marketData?.collateralInfo?.address, curveRoutes)

        handleQuote(quote)

        if (quote) {
          setUSGReceivedValue(quote)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsQuoteLoading(false)
      }
    }

    fetchZapValue()
  }

  const maxLiquidateString = useMemo(() => {
    if (currentAddress && marketData) {
      return `Max: ${formatBigInt(maxLiquidable, 18, 2)} ${marketData?.collateralInfo?.symbol}`
    }
    return `Max: 0 ${marketData?.collateralInfo?.symbol}`
  }, [maxLiquidable, currentAddress, marketData])

  const contextValue: USGLiquidateContextValues = {
    actionLiquidate,
    formState,
    liquidateWeiValue,
    setLiquidateWeiValue,
    isFullLiquidation,
    setIsFullLiquidation,
    maxLiquidable,
    liquidablePercentage,
    setLiquidablePercentage,
    isQuoteLoading,
    setIsQuoteLoading,
    USGReceivedValue,
    setUSGReceivedValue,
    repayWeiValue,
    setRepayWeiValue,
    repayablePercentage,
    setRepayablePercentage,
    maxRepayable,
    handleLiquidateValueChange,
    slippage,
    setSlippage,
    maxLiquidateString,
  }

  return <USGLiquidateContext.Provider value={contextValue}>{children}</USGLiquidateContext.Provider>
}

export const useUSGLiquidateContext = () => {
  const context = useContext(USGLiquidateContext)
  if (!context) {
    throw new Error("useUSGLiquidateContext must be used within a USGLiquidateProvider")
  }
  return context
}
