"use client"

import { AssetDataPriced, FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketLiquidate, getLiquidateFormState } from "./usg_record_liquidate_controller"
import { USG_CONTRACT } from "../../tg_usd_repository"
import { getQuote, getRoute } from "../../global_quote_controller"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"
import { maxUint256 } from "viem"
import { useUSGContext } from "../../tg_usd_context"

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
  onChangeIsFullLiquidation: (arg: boolean) => void
  maxLiquidable: bigint
  liquidablePercentage: number
  setLiquidablePercentage: (arg: number) => void

  isQuoteLoading: boolean
  setIsQuoteLoading: (arg: boolean) => void

  tgUSDReceivedValue: bigint | undefined
  setTgUSDReceivedValue: (arg: bigint | undefined) => void

  repayWeiValue?: bigint
  setRepayWeiValue: (arg: bigint | undefined) => void

  repayablePercentage: number
  setRepayablePercentage: (arg: number) => void

  slippage: number
  setSlippage: (arg: number) => void

  maxRepayable: bigint

  handleLiquidateValueChange: (arg: bigint | undefined) => void
}

export const USGLiquidateContext = createContext<USGLiquidateContextValues | undefined>(undefined)

export const USGLiquidateProvider = ({ children }: USGLiquidateContextProps) => {
  const { loadUSGsUSGMetrics } = useUSGContext()

  const { marketData, marketInfo, loadOnChainData, marketDisplayData, setCurrentAmounts } = useUSGRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [liquidablePercentage, setLiquidablePercentage] = useState<number>(0)

  const [repayablePercentage, setRepayablePercentage] = useState<number>(0)

  const [slippage, setSlippage] = useState<number>(1)

  const [isQuoteLoading, setIsQuoteLoading] = useState<boolean>(false)

  const [isFullLiquidation, setIsFullLiquidation] = useState<boolean>(false)

  const [liquidateWeiValue, setLiquidateWeiValue] = useState<bigint | undefined>()

  const [repayWeiValue, setRepayWeiValue] = useState<bigint | undefined>()

  const [tgUSDReceivedValue, setTgUSDReceivedValue] = useState<bigint | undefined>()

  const onChangeIsFullLiquidation = (liquidateFull: boolean) => {
    setIsFullLiquidation(liquidateFull)

    if (!liquidateFull) {
      setLiquidateWeiValue(0n)
      setLiquidablePercentage(0)
    }
  }

  useEffect(() => {
    if (isFullLiquidation) {
      setRepayWeiValue(marketData?.debtInfos?.userDebt)
      handleLiquidateValueChange(marketData?.collateralInfos?.positionCollateralAmount)
    } else {
      setLiquidateWeiValue(0n)
      setRepayWeiValue(0n)
      setTgUSDReceivedValue(0n)
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

    if (walletClient && liquidateWeiValue && currentAddress && tgUSDReceivedValue && marketData) {
      let repayValue = repayWeiValue || 0n
      if (repayWeiValue === maxRepayable) {
        repayValue = maxUint256
      }
      const liquidationData = await getRoute(
        marketInfo?.collatAddress,
        USG_CONTRACT.USG,
        liquidateWeiValue,
        0n,
        USG_CONTRACT.LIQUIDATOR_PROXY,
        USG_CONTRACT.LIQUIDATOR_PROXY,
        currentAddress
      )

      doMarketLiquidate(
        liquidateWeiValue,
        repayValue,
        (tgUSDReceivedValue * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100),
        liquidationData!,
        walletClient,
        marketData?.marketAddress
      )
        .then(() => {
          loadUSGsUSGMetrics()
          loadOnChainData()
          setLiquidateWeiValue(0n)
          setRepayWeiValue(0n)
          setTgUSDReceivedValue(0n)
        })
        .catch(() => {
          toast.error(ToastComponent, { data: { type: "Error", content: "Something wrong happened" } })
        })
    }
  }

  const formState = useMemo(() => {
    if (marketData && liquidateWeiValue) {
      return getLiquidateFormState(marketData, liquidateWeiValue, repayWeiValue || 0n, isWellConnected, isQuoteLoading)
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
        const { quote } = await getQuote(value, currentAddress, assetInfo?.address, marketData?.collateralInfo?.address)

        if (quote) {
          setTgUSDReceivedValue(quote)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsQuoteLoading(false)
      }
    }

    fetchZapValue()
  }

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
    tgUSDReceivedValue,
    setTgUSDReceivedValue,
    repayWeiValue,
    setRepayWeiValue,
    repayablePercentage,
    setRepayablePercentage,
    maxRepayable,
    handleLiquidateValueChange,
    onChangeIsFullLiquidation,
    slippage,
    setSlippage,
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
