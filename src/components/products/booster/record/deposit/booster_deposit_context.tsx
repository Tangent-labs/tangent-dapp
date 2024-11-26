"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { useBoosterRecordContext } from "@products/booster/record/booster_record_context"
import { FormState, SelectAssetLogoOption, SelectOptionAmount } from "@/types"
import { BoosterDepositAssetInfo, BoosterDepositParams, BoosterDepositType } from "@products/booster/booster_type"
import {
  doApprove,
  doBoosterDeposit,
  getDepositAssetInfo,
  getExpectedSdAsset,
  getFormState,
  getPositionInfo,
} from "@/components/products/booster/record/deposit/booster_deposit_controller"

type BoosterDepositProps = {
  children: ReactNode
}

type BoosterDepositContextValues = {
  weiValue?: bigint
  setWeiValue: (arg: bigint | undefined) => void
  depositAssetOptions: SelectAssetLogoOption[]
  currentAssetInfo?: BoosterDepositAssetInfo
  setCurrentAsset: (arg: BoosterDepositType) => void
  formState: FormState
  actionDeposit: () => void
  actionApprove: () => void
  positionInfos: SelectOptionAmount[]
  currentPosition?: string
  setCurrentPosition: (arg: string) => void
  expected?: bigint
}

export const BoosterDepositContext = createContext<BoosterDepositContextValues | undefined>(undefined)

export const BoosterDepositProvider = ({ children }: BoosterDepositProps) => {
  const { stakingInfo, onChainData, tokenInfo, reloadOnChainData } = useBoosterRecordContext()
  const [weiValue, setWeiValue] = useState<bigint | undefined>()
  const [expected, setExpected] = useState<bigint | undefined>()
  const [currentPosition, setCurrentPosition] = useState<string | undefined>()
  const [currentAsset, setCurrentAsset] = useState<BoosterDepositType>("asset")

  const { getWalletClient } = useWalletConnexionContext()

  const currentAssetInfo = useMemo(() => {
    if (onChainData) return getDepositAssetInfo(currentAsset, onChainData, stakingInfo, tokenInfo)
  }, [currentAsset, onChainData])

  const positionInfos = useMemo(() => {
    if (!onChainData) return []
    const { list, selected } = getPositionInfo(onChainData, stakingInfo)
    if (!currentPosition && !!selected) setCurrentPosition(selected.value)
    return list
  }, [onChainData])

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

  useEffect(() => {
    if (expected) setExpected(undefined)
    if (!weiValue || weiValue === 0n || currentAsset !== "asset") return
    ;(async () => {
      try {
        const result = await getExpectedSdAsset(stakingInfo.stakingAddress, weiValue, true)
        setExpected(result?.sdAssetAmountOut)
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error)
      }
    })()
  }, [weiValue, currentAsset])

  const formState = useMemo<FormState>(() => getFormState(currentAssetInfo, weiValue, expected, true), [currentAsset, weiValue, onChainData, expected])

  const actionApprove = async () => {
    if (!currentAssetInfo?.address) return
    await doApprove(getWalletClient()!, currentAssetInfo.current, currentAssetInfo.address, weiValue || 0n, stakingInfo.stakingAddress).then(() => {
      reloadOnChainData()
    })
  }
  const actionDeposit = async () => {
    if (!weiValue || weiValue === 0n) return
    if (!currentAssetInfo?.current) return

    let expectedSdAsset = 0n
    if (currentAssetInfo?.current === "asset") {
      if (!expected) return
      const splippage = 0.01
      const slippageBigInt = BigInt(splippage * 100)
      expectedSdAsset = expected - (expected * slippageBigInt) / 100n
    }

    const params: BoosterDepositParams = {
      walletClient: getWalletClient()!,
      tokenId: Number(currentPosition) || 0,
      current: currentAssetInfo.current,
      isLock: true,
      expectedSdAsset,
      stakingInfo,
      weiValue,
    }
    await doBoosterDeposit(params)
    reloadOnChainData()
  }

  const contextValue: BoosterDepositContextValues = {
    weiValue,
    setWeiValue,
    depositAssetOptions,
    currentAssetInfo,
    setCurrentAsset,
    formState,
    actionApprove,
    actionDeposit,
    positionInfos,
    currentPosition,
    setCurrentPosition,
    expected,
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
