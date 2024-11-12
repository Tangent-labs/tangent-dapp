"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { useBoosterRecordContext } from "@products/booster/record/booster_record_context"
import { FormState, SelectAssetLogoOption } from "@/types"
import { BoosterDepositAssetInfo, BoosterDepositParams, BoosterDepositType } from "@products/booster/booster_type"
import { doApprove, doBoosterDeposit, getDepositAssetInfo, getFormState } from "@/components/products/booster/record/deposit/booster_deposit_controller"

type BoosterDepositProps = {
  children: ReactNode
}

type BoosterDepositContextValues = {
  weiValue: bigint
  setWeiValue: (arg: bigint) => void
  depositAssetOptions: SelectAssetLogoOption[]
  currentAssetInfo?: BoosterDepositAssetInfo
  formState: FormState
  actionDeposit: () => void
  actionApprove: () => void
}

export const BoosterDepositContext = createContext<BoosterDepositContextValues | undefined>(undefined)

export const BoosterDepositProvider = ({ children }: BoosterDepositProps) => {
  const { stakingInfo, onChainData } = useBoosterRecordContext()
  const [weiValue, setWeiValue] = useState<bigint>(0n)
  const [currentAsset] = useState<BoosterDepositType>("asset")
  const { getWalletClient } = useWalletConnexionContext()

  const currentAssetInfo = useMemo(() => {
    if (onChainData) return getDepositAssetInfo(currentAsset, onChainData, stakingInfo)
  }, [currentAsset, onChainData])

  const depositAssetOptions = useMemo(() => {
    return [
      {
        label: stakingInfo.asset,
        value: "asset",
        logo: stakingInfo.asset,
      },
      {
        label: stakingInfo.sdAsset,
        value: "sdAsset",
        logo: stakingInfo.sdAsset,
      },
      {
        label: `${stakingInfo.sdAsset}-gauge`,
        value: "gaugeAsset",
        logo: stakingInfo.sdAsset,
      },
    ] as SelectAssetLogoOption[]
  }, [])

  const formState = useMemo<FormState>(() => getFormState(currentAssetInfo, weiValue, true), [currentAsset, weiValue])

  const actionApprove = async () => {
    await doApprove(getWalletClient()!, currentAsset, weiValue, stakingInfo.stakingAddress)
  }
  const actionDeposit = async () => {
    const params: BoosterDepositParams = {
      walletClient: getWalletClient()!,
      tokenId: 0,
      currentAsset: currentAssetInfo!,
      isLock: true,
      splippage: 0.01,
      stakingInfo,
      weiValue,
    }
    await doBoosterDeposit(params)
  }

  const contextValue: BoosterDepositContextValues = {
    weiValue,
    setWeiValue,
    depositAssetOptions,
    currentAssetInfo,
    formState,
    actionApprove,
    actionDeposit,
  }

  return <BoosterDepositContext.Provider value={contextValue}>{children}</BoosterDepositContext.Provider>
}

export const useBoosterDepositContext = () => {
  const context = useContext(BoosterDepositContext)
  if (!context) {
    throw new Error("useBoosterDepositContext must be used within a BoosterDepositProvider")
  }
  return context
}
