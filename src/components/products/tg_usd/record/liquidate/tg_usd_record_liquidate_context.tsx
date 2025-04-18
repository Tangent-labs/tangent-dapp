"use client"

import { FormState } from "@/types"
import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketLiquidate, getLiquidateFormState } from "./tg_usd_record_liquidate_controller"

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
  maxLiquidable: string
  liquidablePercentage: number
  setLiquidablePercentage: (arg: number) => void
}

export const TgUsdLiquidateContext = createContext<TgUsdLiquidateContextValues | undefined>(undefined)

export const TgUsdLiquidateProvider = ({ children }: TgUsdLiquidateContextProps) => {
  const { marketData, loadOnChainData, marketDisplayData } = useTgUsdRecordContext()

  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const [liquidablePercentage, setLiquidablePercentage] = useState<number>(0)

  const [isFullLiquidation, setIsFullLiquidation] = useState<boolean>(false)

  const [liquidateWeiValue, setLiquidateWeiValue] = useState<bigint | undefined>()

  const actionLiquidate = () => {
    const walletClient = getWalletClient()
    if (walletClient) doMarketLiquidate(walletClient, { marketAddress: marketData!.marketAddress, liquidateWeiValue }).then(() => loadOnChainData())
  }

  const formState = useMemo(
    () => getLiquidateFormState(marketData, liquidateWeiValue, isWellConnected),
    [marketData, liquidateWeiValue, isWellConnected, currentAddress]
  )

  const maxLiquidable = useMemo(() => {
    if (!!marketDisplayData.collateralValue && marketDisplayData.collateralValue !== "-") {
      return marketDisplayData.collateralValue
    }
    return ""
  }, [marketDisplayData])

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
