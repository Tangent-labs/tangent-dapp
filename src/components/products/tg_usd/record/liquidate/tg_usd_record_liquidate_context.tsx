"use client"

import { AssetDataPriced, FormState } from "@/types"
import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketLiquidate, getLiquidateFormState } from "./tg_usd_record_liquidate_controller"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"
import { returnEnsoQuote } from "../../global_quote_controller"

type TgUsdLiquidateContextProps = {
  children: ReactNode
}

type TgUsdLiquidateContextValues = {
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

  tgUSDReceivedValue: bigint | undefined
  setTgUSDReceivedValue: (arg: bigint | undefined) => void

  repayWeiValue?: bigint
  setRepayWeiValue: (arg: bigint | undefined) => void

  repayablePercentage: number
  setRepayablePercentage: (arg: number) => void

  maxRepayable: bigint

  handleLiquidateValueChange: (arg: bigint | undefined) => void
}

export const TgUsdLiquidateContext = createContext<TgUsdLiquidateContextValues | undefined>(undefined)

export const TgUsdLiquidateProvider = ({ children }: TgUsdLiquidateContextProps) => {
  const { marketData, loadOnChainData, marketDisplayData } = useTgUsdRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [liquidablePercentage, setLiquidablePercentage] = useState<number>(0)

  const [repayablePercentage, setRepayablePercentage] = useState<number>(0)

  const [isQuoteLoading, setIsQuoteLoading] = useState<boolean>(false)

  const [isFullLiquidation, setIsFullLiquidation] = useState<boolean>(false)

  const [liquidateWeiValue, setLiquidateWeiValue] = useState<bigint | undefined>()

  const [repayWeiValue, setRepayWeiValue] = useState<bigint | undefined>()

  const [tgUSDReceivedValue, setTgUSDReceivedValue] = useState<bigint | undefined>()

  const routerCall = "douzee"

  const actionLiquidate = () => {
    const walletClient = getWalletClient()
    if (marketData && walletClient && currentAddress && repayWeiValue && tgUSDReceivedValue) {
      doMarketLiquidate(walletClient, marketData?.marketAddress, currentAddress, repayWeiValue, tgUSDReceivedValue, routerCall).then(() => {
        loadOnChainData()
        setLiquidateWeiValue(0n)
        setRepayWeiValue(0n)
        setTgUSDReceivedValue(0n)
      })
    }
  }

  const formState = useMemo(
    () => getLiquidateFormState(marketData, liquidateWeiValue, isWellConnected),
    [marketData, liquidateWeiValue, isWellConnected, currentAddress]
  )

  const maxLiquidable = useMemo(() => {
    if (marketData) {
      return marketData?.collateralInfos?.positionCollateralAmount
    }
    return 0n
  }, [marketDisplayData])

  const maxRepayable = useMemo(() => {
    if (marketData) {
      return marketData?.debtInfos?.totalDebt
    }
    return 0n
  }, [marketDisplayData])

  const handleLiquidateValueChange = (value: bigint | undefined) => {
    const assetInfo: AssetDataPriced = {
      address: TGUSD_CONTRACT.TG_USD,
      decimals: 18,
      displayDecimals: 2,
      logo: "tgUSD",
      name: "tgUSD",
      price: 1,
      symbol: "tgUSD",
    }

    setLiquidateWeiValue(value)

    const fetchZapValue = async () => {
      if (!value || !currentAddress || !marketData) return

      setIsQuoteLoading(true)
      try {
        const data = await returnEnsoQuote(value, currentAddress, assetInfo, marketData?.collateralInfo)

        if (data) {
          setTgUSDReceivedValue(data.amountOut)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsQuoteLoading(false)
      }
    }

    fetchZapValue()
  }

  const contextValue: TgUsdLiquidateContextValues = {
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
  }

  return <TgUsdLiquidateContext.Provider value={contextValue}>{children}</TgUsdLiquidateContext.Provider>
}

export const useTgUsdLiquidateContext = () => {
  const context = useContext(TgUsdLiquidateContext)
  if (!context) {
    throw new Error("useTgUsdLiquidateContext must be used within a TgUsdLiquidateProvider")
  }
  return context
}
