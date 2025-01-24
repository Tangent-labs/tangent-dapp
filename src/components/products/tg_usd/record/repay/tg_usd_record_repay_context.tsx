"use client"

import { FormState } from "@/types"
import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketRepay, getRepayFormState } from "./tg_usd_record_repay_controller"

type TgUsdRepayContextProps = {
  children: ReactNode
}

type TgUsdRepayContextValues = {
  actionRepay: () => void
  formState: FormState
  repayWeiValue?: bigint
  setRepayWeiValue: (arg: bigint | undefined) => void
}

export const TgUsdRepayContext = createContext<TgUsdRepayContextValues | undefined>(undefined)

export const TgUsdRepayProvider = ({ children }: TgUsdRepayContextProps) => {
  const [repayWeiValue, setRepayWeiValue] = useState<bigint | undefined>()
  const { marketData, loadOnChainData } = useTgUsdRecordContext()
  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const actionRepay = () => {
    const walletClient = getWalletClient()
    if (walletClient) doMarketRepay(walletClient, { marketAddress: marketData!.marketAddress, repayWeiValue }).then(() => loadOnChainData())
  }

  const formState = useMemo(() => getRepayFormState(marketData, repayWeiValue, isWellConnected), [marketData, repayWeiValue, isWellConnected, currentAddress])

  const contextValue: TgUsdRepayContextValues = {
    actionRepay,
    formState,
    repayWeiValue,
    setRepayWeiValue,
  }

  return <TgUsdRepayContext.Provider value={contextValue}>{children}</TgUsdRepayContext.Provider>
}

export const useTgUsdRepayContext = () => {
  const context = useContext(TgUsdRepayContext)
  if (!context) {
    throw new Error("useTgUsdRepayContext must be used within a TgUsdRepayProvider")
  }
  return context
}
