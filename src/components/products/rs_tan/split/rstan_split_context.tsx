"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useRsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { doSplit } from "./rstan_split_controller"
import { formatBigInt } from "@/lib/number_formatter"

type RsTanSplitContextProps = {
  children: ReactNode
}

type RsTanSplitContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  splitPositionInfo: LockPosition | undefined

  splitPosition: string
  setSplitPosition: (arg: string) => void

  splitPercentage: number
  setSplitPercentage: (arg: number) => void

  actionSplit: () => void

  computedSplitAmounts: { firstSplit: string; secondSplit: string }

  visualPercentage: number

  computedNewPositionIds: { newPositionId1: string; newPositionId2: string }
}

export const RsTanSplitContext = createContext<RsTanSplitContextValues | undefined>(undefined)

export const RsTanSplitProvider = ({ children }: RsTanSplitContextProps) => {
  const { getWalletClient } = useWalletConnexionContext()

  const { loadData, lockData } = useRsTanContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [splitPercentage, setSplitPercentage] = useState<number>(50)

  const [splitPosition, setSplitPosition] = useState<string>("")

  const visualPercentage = ((splitPercentage - 10) / (90 - 10)) * 100

  const splitPositionInfo = useMemo(() => {
    const pos = lockData?.positions.find((position) => position?.tokenId.toString() === splitPosition)

    return pos
  }, [splitPosition])

  const computedNewPositionIds = useMemo(() => {
    if (!lockData || !lockData.positions || lockData.positions.length === 0) {
      return { newPositionId1: "001", newPositionId2: "002" }
    }

    const maxTokenId = lockData.positions.reduce((max, position) => {
      const tokenIdNumber = Number(position.tokenId)
      return tokenIdNumber > max ? tokenIdNumber : max
    }, 0)

    const newPositionId1 = Number(splitPositionInfo?.tokenId).toString()
    const newPositionId2 = (maxTokenId + 1).toString()

    return { newPositionId1, newPositionId2 }
  }, [lockData, splitPositionInfo])

  const computedSplitAmounts = useMemo(() => {
    if (!splitPositionInfo || !splitPositionInfo.amount) {
      return { firstSplit: "0", secondSplit: "0" }
    }

    const totalAmount = splitPositionInfo.amount
    const firstSplitAmount = (totalAmount * BigInt(Math.round(splitPercentage * 100))) / BigInt(10000)
    const secondSplitAmount = totalAmount - firstSplitAmount

    return {
      firstSplit: formatBigInt(firstSplitAmount, 18, 2),
      secondSplit: formatBigInt(secondSplitAmount, 18, 2),
    }
  }, [splitPercentage, splitPositionInfo])

  const actionSplit = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && splitPositionInfo) {
      const amountToRemove = (splitPositionInfo.amount * BigInt(100 - splitPercentage)) / BigInt(100)

      await doSplit(splitPositionInfo?.tokenId, walletClient, amountToRemove)
      loadData()
      setIsLoading(false)
      setSplitPosition("")
    } else {
      setIsLoading(false)
    }
  }

  const contextValue: RsTanSplitContextValues = {
    isLoading,
    setIsLoading,
    splitPosition,
    setSplitPosition,
    splitPositionInfo,
    actionSplit,
    splitPercentage,
    setSplitPercentage,
    computedSplitAmounts,
    visualPercentage,
    computedNewPositionIds,
  }

  return <RsTanSplitContext.Provider value={contextValue}>{children}</RsTanSplitContext.Provider>
}

export const useRsTanSplitContext = () => {
  const context = useContext(RsTanSplitContext)
  if (!context) {
    throw new Error("useRsTanSplitContext must be used within a RsTanSplitProvider")
  }
  return context
}
