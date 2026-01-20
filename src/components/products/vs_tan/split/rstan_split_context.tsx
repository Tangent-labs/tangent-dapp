"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useVsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { LockPosition } from "../../usg/usg_type"
import { doSplit, getSplitFormState } from "./rstan_split_controller"
import { formatBigInt } from "@/lib/number_formatter"
import { FormState } from "@/types"

type VsTanSplitContextProps = {
  children: ReactNode
}

type VsTanSplitContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  splitPositionInfo: LockPosition | undefined

  formState: FormState

  splitPosition: string
  setSplitPosition: (arg: string) => void

  splitPercentage: number
  setSplitPercentage: (arg: number) => void

  actionSplit: () => void

  computedSplitAmounts: { firstSplit: string; secondSplit: string }

  visualPercentage: number

  computedNewPositionIds: { newPositionId1: string; newPositionId2: string }
}

export const VsTanSplitContext = createContext<VsTanSplitContextValues | undefined>(undefined)

export const VsTanSplitProvider = ({ children }: VsTanSplitContextProps) => {
  const { walletClient, isWellConnected } = useWalletConnexionContext()

  const { loadData, lockData } = useVsTanContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [formState, setFormState] = useState<FormState>({ canProcess: false, cantProcessReasons: [], haveToApprove: false })

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

  useEffect(() => {
    const computeFormState = async () => {
      if (!lockData || !splitPositionInfo) {
        setFormState({ canProcess: false, cantProcessReasons: ["Form is empty"], haveToApprove: false })
      } else {
        getSplitFormState(splitPositionInfo, isWellConnected).then((d) => {
          setFormState(d)
        })
      }
    }

    if (splitPositionInfo) {
      computeFormState()
    }
  }, [splitPositionInfo, lockData])

  const contextValue: VsTanSplitContextValues = {
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
    formState,
  }

  return <VsTanSplitContext.Provider value={contextValue}>{children}</VsTanSplitContext.Provider>
}

export const useVsTanSplitContext = () => {
  const context = useContext(VsTanSplitContext)
  if (!context) {
    throw new Error("useVsTanSplitContext must be used within a VsTanSplitProvider")
  }
  return context
}
