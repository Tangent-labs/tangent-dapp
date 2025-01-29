"use client"

import { AssetDataPriced, FormState } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { TgUsdMarket } from "../../tg_usd_type"
import { doApproveMarketDeposit, doMarketDeposit, getDepositFormState } from "./tg_usd_record_deposit_controller"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

type TgUsdDepositContextProps = {
  children: ReactNode
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
}

type TgUsdDepositContextValues = {
  marketInfo: TgUsdMarket
  collateralInfo: AssetDataPriced
  isStaking: boolean
  setIsStaking: (arg: boolean) => void
  isDepositAndBorrow: boolean
  setIsDepositAndBorrow: (arg: boolean) => void
  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void
  actionDeposit: () => void
  actionApprove: () => void
  formState: FormState
  borrowWeiValue?: bigint
  setBorrowWeiValue: (arg: bigint | undefined) => void
}

export const TgUsdDepositContext = createContext<TgUsdDepositContextValues | undefined>(undefined)

export const TgUsdDepositProvider = ({ children, collateralInfo, marketInfo }: TgUsdDepositContextProps) => {
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [isDepositAndBorrow, setIsDepositAndBorrow] = useState<boolean>(false)
  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()
  const [borrowWeiValue, setBorrowWeiValue] = useState<bigint | undefined>()
  const { marketData, loadOnChainData, setCurrentAmounts } = useTgUsdRecordContext()
  const { isWellConnected, getWalletClient, currentAddress } = useWalletConnexionContext()

  useEffect(() => {
    setCurrentAmounts({
      depositWeiValue: depositWeiValue || 0n,
      borrowWeiValue: borrowWeiValue || 0n,
    })
  }, [depositWeiValue, borrowWeiValue])

  const actionApprove = () => {
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue)
      doApproveMarketDeposit(walletClient, collateralInfo?.address, {
        depositWeiValue,
        isDepositAndBorrow,
        isStaking,
        marketAddress: marketInfo?.marketAddress,
      }).then(() => loadOnChainData())
  }

  const actionDeposit = () => {
    const walletClient = getWalletClient()
    if (walletClient && depositWeiValue)
      doMarketDeposit(walletClient, { depositWeiValue, isDepositAndBorrow, isStaking, marketAddress: marketInfo?.marketAddress, borrowWeiValue }).then(() =>
        loadOnChainData()
      )
  }

  const formState = useMemo(
    () => getDepositFormState(marketData, depositWeiValue, borrowWeiValue, isDepositAndBorrow, isWellConnected),
    [marketData, isDepositAndBorrow, borrowWeiValue, depositWeiValue, isWellConnected, currentAddress]
  )

  const contextValue: TgUsdDepositContextValues = {
    marketInfo,
    collateralInfo,
    isStaking,
    setIsStaking,
    isDepositAndBorrow,
    setIsDepositAndBorrow,
    depositWeiValue,
    setDepositWeiValue,
    actionApprove,
    actionDeposit,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
  }

  return <TgUsdDepositContext.Provider value={contextValue}>{children}</TgUsdDepositContext.Provider>
}

export const useTgUsdDepositContext = () => {
  const context = useContext(TgUsdDepositContext)
  if (!context) {
    throw new Error("useTgUsdDepositContext must be used within a TgUsdDepositProvider")
  }
  return context
}
