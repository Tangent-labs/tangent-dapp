"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useVsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { FormState, LockPosition } from "../../usg/usg_type"
import { toastTx } from "@/components/design_system/toast"
import { matchBlockChainErrors } from "../../usg/record/usg_record_controller"
import { doSplit, getSplitFormState } from "./rstan_split_controller"
import { useMinLock } from "../use_min_lock"
import { tanAmountToDollar } from "../tan_price"
import { useNextEndLockTime } from "../use_next_end_lock_time"
import { formatBigInt } from "@/lib/number_formatter"

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

  computedSplitAmounts: { firstSplit: string; secondSplit: string; firstSplitDollar: string; secondSplitDollar: string }

  visualPercentage: number

  computedNewPositionIds: { newPositionId1: string; newPositionId2: string }
}

export const VsTanSplitContext = createContext<VsTanSplitContextValues | undefined>(undefined)

const toastErrorMapper = (err: unknown) => {
  const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
  return { type: "Error" as const, content: error || "Unable to proceed with the transaction." }
}

export const VsTanSplitProvider = ({ children }: VsTanSplitContextProps) => {
  const { walletClient, isWellConnected } = useWalletConnexionContext()

  const { loadData, lockData } = useVsTanContext()

  const minLock = useMinLock()

  const { chainTimestamp } = useNextEndLockTime(lockData)

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
      return { firstSplit: "0", secondSplit: "0", firstSplitDollar: "", secondSplitDollar: "" }
    }

    const totalAmount = splitPositionInfo.amount
    const firstSplitAmount = (totalAmount * BigInt(Math.round(splitPercentage * 100))) / BigInt(10000)
    const secondSplitAmount = totalAmount - firstSplitAmount

    return {
      firstSplit: formatBigInt(firstSplitAmount, 18, 2),
      secondSplit: formatBigInt(secondSplitAmount, 18, 2),
      firstSplitDollar: tanAmountToDollar(firstSplitAmount, lockData?.tanPrice),
      secondSplitDollar: tanAmountToDollar(secondSplitAmount, lockData?.tanPrice),
    }
  }, [splitPercentage, splitPositionInfo, lockData])

  const amountToRemove = useMemo(
    () => (splitPositionInfo ? (splitPositionInfo.amount * BigInt(100 - splitPercentage)) / BigInt(100) : 0n),
    [splitPositionInfo, splitPercentage]
  )

  const actionSplit = async () => {
    if (isLoading || !walletClient || !splitPositionInfo) return

    setIsLoading(true)

    try {
      await toastTx(doSplit(splitPositionInfo?.tokenId, walletClient, amountToRemove), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({ type: "Success", content: "Position successfully split in two." }),
        error: toastErrorMapper,
      })

      loadData()
      setSplitPosition("")
    } catch {
      // toastTx already surfaced the failure
    } finally {
      setIsLoading(false)
    }
  }

  const formState = useMemo<FormState>(
    () => getSplitFormState(splitPositionInfo, amountToRemove, minLock, chainTimestamp, isWellConnected),
    [splitPositionInfo, amountToRemove, minLock, chainTimestamp, isWellConnected]
  )

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
