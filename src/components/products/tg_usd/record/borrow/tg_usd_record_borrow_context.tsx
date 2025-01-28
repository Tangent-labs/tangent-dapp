"use client"

import { FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doMarketBorrow, getBorrowFormState } from "./tg_usd_record_borrow_controller"

type TgUsdBorrowContextProps = {
  children: ReactNode
}

type TgUsdBorrowContextValues = {
  actionBorrow: () => void
  formState: FormState
  borrowWeiValue?: bigint
  setBorrowWeiValue: (arg: bigint | undefined) => void
}

export const TgUsdBorrowContext = createContext<TgUsdBorrowContextValues | undefined>(undefined)

export const TgUsdBorrowProvider = ({ children }: TgUsdBorrowContextProps) => {
  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()
  const { marketData, loadOnChainData, setCurrentAmounts } = useTgUsdRecordContext()
  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  const actionBorrow = () => {
    const walletClient = getWalletClient()
    if (walletClient) doMarketBorrow(walletClient, { marketAddress: marketData!.marketAddress, borrowWeiValue }).then(() => loadOnChainData())
  }

  useEffect(() => {
    setCurrentAmounts({
      borrowWeiValue: borrowWeiValue || 0n,
    })
  }, [borrowWeiValue])

  const formState = useMemo(
    () => getBorrowFormState(marketData, borrowWeiValue, isWellConnected),
    [marketData, borrowWeiValue, isWellConnected, currentAddress]
  )

  const contextValue: TgUsdBorrowContextValues = {
    actionBorrow,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
  }

  return <TgUsdBorrowContext.Provider value={contextValue}>{children}</TgUsdBorrowContext.Provider>
}

export const useTgUsdBorrowContext = () => {
  const context = useContext(TgUsdBorrowContext)
  if (!context) {
    throw new Error("useTgUsdBorrowContext must be used within a TgUsdBorrowProvider")
  }
  return context
}
