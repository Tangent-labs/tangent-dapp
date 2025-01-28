"use client"

import { FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketWithdraw, getWithdrawFormState } from "./tg_usd_record_withdraw_controller"

type TgUsdWithdrawContextProps = {
  children: ReactNode
}

type TgUsdWithdrawContextValues = {
  actionWithdraw: () => void
  formState: FormState
  withdrawWeiValue?: bigint
  setWithdrawWeiValue: (arg: bigint | undefined) => void
}

export const TgUsdWithdrawContext = createContext<TgUsdWithdrawContextValues | undefined>(undefined)

export const TgUsdWithdrawProvider = ({ children }: TgUsdWithdrawContextProps) => {
  const [withdrawWeiValue, setWithdrawWeiValue] = useState<bigint | undefined>()
  const { marketData, loadOnChainData, setCurrentAmounts } = useTgUsdRecordContext()
  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    setCurrentAmounts({
      withdrawWeiValue: withdrawWeiValue || 0n,
    })
  }, [withdrawWeiValue])

  const actionWithdraw = () => {
    const walletClient = getWalletClient()
    if (walletClient) doMarketWithdraw(walletClient, { marketAddress: marketData!.marketAddress, withdrawWeiValue }).then(() => loadOnChainData())
  }

  const formState = useMemo(
    () => getWithdrawFormState(marketData, withdrawWeiValue, isWellConnected),
    [marketData, withdrawWeiValue, isWellConnected, currentAddress]
  )

  const contextValue: TgUsdWithdrawContextValues = {
    actionWithdraw,
    formState,
    withdrawWeiValue,
    setWithdrawWeiValue,
  }

  return <TgUsdWithdrawContext.Provider value={contextValue}>{children}</TgUsdWithdrawContext.Provider>
}

export const useTgUsdWithdrawContext = () => {
  const context = useContext(TgUsdWithdrawContext)
  if (!context) {
    throw new Error("useTgUsdWithdrawContext must be used within a TgUsdWithdrawProvider")
  }
  return context
}
