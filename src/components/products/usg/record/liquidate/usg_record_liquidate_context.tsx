"use client"

import { maxUint256 } from "viem"
import { FormState } from "@/types"
import { useUSGContext } from "../../usg_context"
import { USG_CONTRACT } from "../../usg_repository"
import { formatBigInt } from "@/lib/number_formatter"
import { toastTx } from "@/components/design_system/toast"
import { useUSGRecordContext } from "../usg_record_context"
import { getQuote, getRoute } from "../../global_quote_controller"
import { useRootContext } from "@/components/products/root/root_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { doMarketLiquidate, getLiquidateFormState } from "./usg_record_liquidate_controller"
import { computedMinAmountOut, computeTransactionPotentialLoss } from "../usg_record_controller"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { BuyAndMinOutFormatted } from "../leverage/types"

type USGLiquidateContextProps = {
  children: ReactNode
}

type USGLiquidateContextValues = {
  actionLiquidate: () => void
  formState: FormState
  liquidateWeiValue?: bigint
  setLiquidateWeiValue: (arg: bigint | undefined) => void

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

  priceImpact: number

  priceImpactLoss: string

  isTransactionBlockedByPriceImpact: boolean
  setIsTransactionBlockedByPriceImpact: (arg: boolean) => void

  zapValuesFormatted: BuyAndMinOutFormatted

  isTransactionBlockedBySlippage: boolean
  setIsTransactionBlockedBySlippage: (arg: boolean) => void

  slippageLoss: { tokenLoss: string; dollarLoss: string }
  walletRepayValue: bigint
  collateralRepayValue: bigint
  isTransactionBlockedByWalletRepay: boolean
  setIsTransactionBlockedByWalletRepay: (arg: boolean) => void
}

export const USGLiquidateContext = createContext<USGLiquidateContextValues | undefined>(undefined)

export const USGLiquidateProvider = ({ children }: USGLiquidateContextProps) => {
  const { loadUSGsUSGMetrics } = useUSGContext()

  const { curveRoutes, handleQuote } = useRootContext()

  const { isWellConnected, walletClient, currentAddress } = useWalletConnexionContext()

  const { marketData, marketInfo, loadOnChainData, marketDisplayData, setCurrentAmounts, collateralInfo, isTxLoading, setIsTxLoading } = useUSGRecordContext()

  const [slippage, setSlippage] = useState<number>(0.2)

  const [isQuoteLoading, setIsQuoteLoading] = useState<boolean>(false)

  const [liquidateWeiValue, setLiquidateWeiValue] = useState<bigint | undefined>()
  const [liquidablePercentage, setLiquidablePercentage] = useState<number>(0)

  const [USGReceivedValue, setUSGReceivedValue] = useState<bigint | undefined>()

  const [repayWeiValue, setRepayWeiValue] = useState<bigint | undefined>()
  const [repayablePercentage, setRepayablePercentage] = useState<number>(0)

  const [priceImpact, setPriceImpact] = useState<number>(0)

  const [isTransactionBlockedByPriceImpact, setIsTransactionBlockedByPriceImpact] = useState<boolean>(false)

  const [isTransactionBlockedBySlippage, setIsTransactionBlockedBySlippage] = useState<boolean>(false)
  const [isTransactionBlockedByWalletRepay, setIsTransactionBlockedByWalletRepay] = useState<boolean>(false)

  useEffect(() => {
    setLiquidateWeiValue(undefined)
    setRepayWeiValue(undefined)
    setUSGReceivedValue(undefined)
    setIsQuoteLoading(false)
  }, [])

  useEffect(() => {
    setCurrentAmounts({
      liquidateValue: liquidateWeiValue || 0n,
      repayWeiValue: repayWeiValue || 0n,
    })
  }, [liquidateWeiValue, repayWeiValue])

  const actionLiquidate = async () => {
    try {
      setIsTxLoading(true)

      if (walletClient && liquidateWeiValue && currentAddress && USGReceivedValue && marketData) {
        let repayValue = repayWeiValue || 0n

        // Replay value + 0.01% to handle IR
        let maxUSGToBurn = repayValue || 0n
        if (repayWeiValue === maxRepayable && repayWeiValue !== 0n) {
          repayValue = maxUint256
          maxUSGToBurn = repayValue + repayValue / 10_000n
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

        await toastTx(
          doMarketLiquidate(
            liquidateWeiValue,
            repayValue,
            maxUSGToBurn,
            computedMinAmountOut(USGReceivedValue, slippage),
            false,
            liquidationData!,
            walletClient,
            marketInfo?.marketAddress
          ),
          {
            pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },

            success: () => ({
              type: "Success",
              content: "Liquidation successful.",
            }),

            error: () => {
              return { type: "Error", content: "Something wrong happened." }
            },
          }
        )

        setIsTxLoading(false)
        loadUSGsUSGMetrics()
        loadOnChainData()
        setLiquidateWeiValue(undefined)
        setLiquidablePercentage(0)
        setRepayWeiValue(undefined)
        setUSGReceivedValue(undefined)
      }
    } catch {
      setIsTxLoading(false)
    }
  }

  const formState = useMemo(() => {
    if (marketData) {
      return getLiquidateFormState(
        marketData,
        liquidateWeiValue!,
        repayWeiValue || 0n,
        isWellConnected,
        isQuoteLoading || isTxLoading,
        isTransactionBlockedByPriceImpact,
        isTransactionBlockedBySlippage,
        isTransactionBlockedByWalletRepay
      )
    }
    return { canProcess: false, cantProcessReasons: [], haveToApprove: false }
  }, [
    marketData,
    liquidateWeiValue,
    isWellConnected,
    currentAddress,
    isQuoteLoading || isTxLoading,
    repayWeiValue,
    isTransactionBlockedByPriceImpact,
    isTransactionBlockedBySlippage,
    isTransactionBlockedByWalletRepay,
  ])

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
    try {
      setPriceImpact(0)
      setIsQuoteLoading(true)
      setLiquidateWeiValue(value)

      const fetchZapValue = async () => {
        if (!value || !currentAddress || !collateralInfo) return

        try {
          const { quote, priceImpact: pI } = await getQuote(value, currentAddress, USG_CONTRACT.USG, collateralInfo?.address, curveRoutes)

          const { validQuote, validPriceImpact } = handleQuote(quote, pI)

          if (validPriceImpact >= 0 && validQuote) {
            setUSGReceivedValue(validQuote)
            setPriceImpact(Number(validPriceImpact) / 100)
          }

          setIsQuoteLoading(false)
        } catch (error) {
          console.error(error)
          setIsQuoteLoading(false)
        }
      }

      fetchZapValue()
    } catch {
      setIsQuoteLoading(false)
    }
  }

  const maxLiquidateString = useMemo(() => {
    if (currentAddress && collateralInfo) {
      return `Max: ${formatBigInt(maxLiquidable, 18, 2)} ${collateralInfo?.symbol}`
    }
    return `Max: 0 ${collateralInfo?.symbol}`
  }, [maxLiquidable, currentAddress])

  const priceImpactLoss = useMemo(() => {
    const { dollarLoss } = computeTransactionPotentialLoss(liquidateWeiValue as bigint, collateralInfo, priceImpact)

    return dollarLoss
  }, [liquidateWeiValue, priceImpact])

  const slippageLoss = useMemo(() => {
    const { tokenLoss, dollarLoss } = computeTransactionPotentialLoss(liquidateWeiValue as bigint, collateralInfo, slippage)

    return { tokenLoss, dollarLoss }
  }, [slippage, liquidateWeiValue])

  const { collateralRepayValue, walletRepayValue } = useMemo(() => {
    const quotedUsgOut = USGReceivedValue || 0n
    const repayValue = repayWeiValue || 0n
    const collateralRepayValue = quotedUsgOut >= repayValue ? repayValue : quotedUsgOut
    const walletRepayValue = repayValue > collateralRepayValue ? repayValue - collateralRepayValue : 0n

    return { collateralRepayValue, walletRepayValue }
  }, [USGReceivedValue, repayWeiValue])

  useEffect(() => {
    setIsTransactionBlockedByPriceImpact(!!USGReceivedValue && !!liquidateWeiValue && priceImpact >= 1)
  }, [priceImpact, liquidateWeiValue, USGReceivedValue])

  useEffect(() => {
    setIsTransactionBlockedBySlippage(!!USGReceivedValue && !!liquidateWeiValue && slippage >= 1)
  }, [slippage, liquidateWeiValue, USGReceivedValue])

  useEffect(() => {
    setIsTransactionBlockedByWalletRepay(walletRepayValue > 0n)
  }, [walletRepayValue])

  const zapValuesFormatted = useMemo(() => {
    if (!isQuoteLoading && liquidateWeiValue && marketData?.collateralInfos && USGReceivedValue) {
      const minAmountOutWei = computedMinAmountOut(USGReceivedValue, slippage)
      const decimals = collateralInfo?.decimals || 18
      const displayDecimals = collateralInfo?.displayDecimals || 2

      return {
        expectedFormatted: `${formatBigInt(USGReceivedValue, 18, displayDecimals)} `,
        minOutFormatted: `${formatBigInt(minAmountOutWei, decimals, displayDecimals)}`,
      }
    }

    return { expectedFormatted: `-`, minOutFormatted: `-` }
  }, [liquidateWeiValue, isQuoteLoading, slippage, USGReceivedValue])

  const contextValue: USGLiquidateContextValues = {
    actionLiquidate,
    formState,
    liquidateWeiValue,
    setLiquidateWeiValue,
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
    priceImpact,
    priceImpactLoss,
    isTransactionBlockedByPriceImpact,
    setIsTransactionBlockedByPriceImpact,
    zapValuesFormatted,
    isTransactionBlockedBySlippage,
    setIsTransactionBlockedBySlippage,
    slippageLoss,
    walletRepayValue,
    collateralRepayValue,
    isTransactionBlockedByWalletRepay,
    setIsTransactionBlockedByWalletRepay,
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
