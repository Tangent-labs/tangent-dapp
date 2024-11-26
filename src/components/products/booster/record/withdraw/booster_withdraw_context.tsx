"use client"
import { createContext, ReactNode, useContext, useMemo, useState } from "react"

import { getPositionInfo } from "../deposit/booster_deposit_controller"
import { useBoosterRecordContext } from "../booster_record_context"
import { AssetDataPriced, SelectOptionAmount } from "@/types"
import { BoosterGaugeParams } from "../../booster_type"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doBoosterWithdraw } from "./booster_withdraw_controller"

type BoosterWithdrawProps = {
  children: ReactNode
  sdAssetInfo?: AssetDataPriced
}

type BoosterWithdrawContextValues = {
  bool: boolean
  weiValue?: bigint
  setWeiValue: (arg?: bigint) => void
  positionInfos: SelectOptionAmount[]
  currentPosition?: string
  setCurrentPosition: (arg?: string) => void
  actionWithdraw: () => void
  gaugeAssetInfo: AssetDataPriced
}

export const BoosterWithdrawContext = createContext<BoosterWithdrawContextValues | undefined>(undefined)

export const BoosterWithdrawProvider = ({ children, sdAssetInfo }: BoosterWithdrawProps) => {
  const { getWalletClient } = useWalletConnexionContext()
  const { stakingInfo, onChainData, reloadOnChainData } = useBoosterRecordContext()
  const [weiValue, setWeiValue] = useState<bigint | undefined>()
  const [currentPosition, setCurrentPosition] = useState<string | undefined>()

  const positionInfos = useMemo(() => {
    if (!onChainData) return []
    const { list, selected } = getPositionInfo(onChainData, stakingInfo)
    if (!currentPosition && !!selected) setCurrentPosition(selected.value)
    return list
  }, [onChainData])

  const canInteract = useMemo(() => {
    return true
  }, [])

  const actionWithdraw = async () => {
    if (!weiValue || weiValue === 0n) return

    const params: BoosterGaugeParams = {
      walletClient: getWalletClient()!,
      tokenId: Number(currentPosition) || 0,
      stakingInfo,
      weiValue,
    }
    await doBoosterWithdraw(params)
    reloadOnChainData()
  }

  const gaugeAssetInfo = useMemo(() => {
    return { ...sdAssetInfo, symbol: `${sdAssetInfo?.symbol}-gauge`, address: stakingInfo.gaugeAsset } as AssetDataPriced
  }, [])

  const contextValue = {
    bool: true,
    gaugeAssetInfo,
    setWeiValue,
    currentPosition,
    setCurrentPosition,
    canInteract,
    positionInfos,
    actionWithdraw,
  }
  return <BoosterWithdrawContext.Provider value={contextValue}>{children}</BoosterWithdrawContext.Provider>
}

export const useBoosterWithdrawContext = () => {
  const context = useContext(BoosterWithdrawContext)
  if (!context) {
    throw new Error("useBoosterWithdrawContext must be used within a BoosterWithdrawProvider")
  }
  return context
}
