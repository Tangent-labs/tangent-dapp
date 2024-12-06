"use client"
import { createContext, ReactNode, useContext, useMemo, useState } from "react"

import { useBoosterRecordContext } from "../booster_record_context"
import { AssetDataPriced, SelectOptionAmount } from "@/types"
import { BoosterGaugeParams } from "../../booster_type"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doBoosterWithdraw } from "./booster_withdraw_controller"
import { getPositionInfo } from "../booster_record_controller"
import { formatUnits } from "viem"
import { formatBigInt } from "@/lib/number_formatter"

type BoosterWithdrawProps = {
  children: ReactNode
}

type BoosterWithdrawContextValues = {
  bool: boolean
  weiValue?: bigint
  setWeiValue: (arg?: bigint) => void
  positionInfos: SelectOptionAmount[]
  currentPosition?: string
  setCurrentPosition: (arg?: string) => void
  currentPositionInfo?: SelectOptionAmount
  actionWithdraw: () => void
  gaugeAssetInfo: AssetDataPriced
  recieveDollarValue: string
  recieveAmount: string
}

export const BoosterWithdrawContext = createContext<BoosterWithdrawContextValues | undefined>(undefined)

export const BoosterWithdrawProvider = ({ children }: BoosterWithdrawProps) => {
  const { getWalletClient } = useWalletConnexionContext()
  const { stakingInfo, onChainData, reloadOnChainData, sdAssetInfo } = useBoosterRecordContext()
  const [weiValue, setWeiValue] = useState<bigint | undefined>()
  const [currentPosition, setCurrentPosition] = useState<string | undefined>()

  const positionInfos = useMemo(() => {
    if (!onChainData) return []
    const { list, selected } = getPositionInfo(onChainData, stakingInfo, false)
    if (!currentPosition && !!selected) setCurrentPosition(selected.value)
    return list
  }, [onChainData])

  const currentPositionInfo = useMemo(() => {
    const info = positionInfos?.find((p) => p.value === currentPosition)
    return info
  }, [positionInfos, currentPosition])

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
  const recieveAmount = useMemo(() => {
    return formatBigInt(weiValue, sdAssetInfo?.decimals || 18, sdAssetInfo?.displayDecimals || 2)
  }, [weiValue])

  const recieveDollarValue = useMemo(() => {
    return (Number(formatUnits(weiValue || 0n, sdAssetInfo?.decimals || 18)) * (sdAssetInfo?.price || 0))?.toFixed(2)
  }, [weiValue])

  const gaugeAssetInfo = useMemo(() => {
    const gauge = { ...sdAssetInfo, symbol: `${sdAssetInfo?.symbol}-gauge`, address: stakingInfo.gaugeAsset } as AssetDataPriced
    return gauge
  }, [sdAssetInfo])

  const contextValue = {
    bool: true,
    gaugeAssetInfo,
    weiValue,
    setWeiValue,
    currentPosition,
    setCurrentPosition,
    currentPositionInfo,
    canInteract,
    positionInfos,
    actionWithdraw,
    recieveDollarValue,
    recieveAmount,
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
