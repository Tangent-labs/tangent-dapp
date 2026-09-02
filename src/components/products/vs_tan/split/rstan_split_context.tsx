"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useVsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { FormState, LockPosition } from "../../usg/usg_type"
import { toastTx } from "@/components/design_system/toast"
import { matchBlockChainErrors } from "../../usg/record/usg_record_controller"
import { doSplit, getSplitFormState } from "./rstan_split_controller"
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

  // Raw amounts, so the inputs can be edited directly instead of only through the slider
  firstSplitAmount: bigint
  secondSplitAmount: bigint
  setFirstSplitAmount: (arg: bigint) => void
  setSecondSplitAmount: (arg: bigint) => void
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

  const { chainTimestamp } = useNextEndLockTime(lockData)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [splitPosition, setSplitPosition] = useState<string>("")

  const splitPositionInfo = useMemo(() => {
    return lockData?.positions.find((position) => position?.tokenId.toString() === splitPosition)
  }, [splitPosition, lockData])

  const totalAmount = splitPositionInfo?.amount ?? 0n

  // What the NEW position receives. Everything else — the slider, both inputs, the recap and the
  // amount actually sent to split() — is derived from this one value, so they cannot disagree.
  const [amountToRemove, setAmountToRemove] = useState<bigint>(0n)

  // A typed amount larger than the position is clamped below, so the overflow has to be
  // remembered here for the form state to surface it
  const [amountExceedsPosition, setAmountExceedsPosition] = useState<boolean>(false)

  // Reset to an even split whenever another position is picked
  useEffect(() => {
    setAmountToRemove(totalAmount / 2n)
    setAmountExceedsPosition(false)
  }, [totalAmount])

  const firstSplitAmount = totalAmount > amountToRemove ? totalAmount - amountToRemove : 0n
  const secondSplitAmount = amountToRemove

  const splitPercentage = useMemo(() => {
    if (!totalAmount) return 50

    return Number((firstSplitAmount * 10000n) / totalAmount) / 100
  }, [totalAmount, firstSplitAmount])

  const setSplitPercentage = (percentage: number) => {
    if (!totalAmount) return

    setAmountExceedsPosition(false)
    setAmountToRemove((totalAmount * BigInt(Math.round((100 - percentage) * 100))) / 10000n)
  }

  // Typing an amount on either side pins that side and gives the remainder to the other
  const setFirstSplitAmount = (value: bigint) => {
    setAmountExceedsPosition(value > totalAmount)
    setAmountToRemove(value >= totalAmount ? 0n : totalAmount - value)
  }
  const setSecondSplitAmount = (value: bigint) => {
    setAmountExceedsPosition(value > totalAmount)
    setAmountToRemove(value >= totalAmount ? totalAmount : value)
  }

  const visualPercentage = Math.min(100, Math.max(0, ((splitPercentage - 1) / (99 - 1)) * 100))

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
    if (!totalAmount) {
      return { firstSplit: "0", secondSplit: "0", firstSplitDollar: "", secondSplitDollar: "" }
    }

    return {
      firstSplit: formatBigInt(firstSplitAmount, 18, 2),
      secondSplit: formatBigInt(secondSplitAmount, 18, 2),
      firstSplitDollar: tanAmountToDollar(firstSplitAmount, lockData?.tanPrice),
      secondSplitDollar: tanAmountToDollar(secondSplitAmount, lockData?.tanPrice),
    }
  }, [firstSplitAmount, secondSplitAmount, totalAmount, lockData])

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
    () => getSplitFormState(splitPositionInfo, chainTimestamp, isWellConnected, amountExceedsPosition),
    [splitPositionInfo, chainTimestamp, isWellConnected, amountExceedsPosition]
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
    firstSplitAmount,
    secondSplitAmount,
    setFirstSplitAmount,
    setSecondSplitAmount,
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
