"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useVsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { FormState, LockPosition } from "../../usg/usg_type"
import { toastTx } from "@/components/design_system/toast"
import { matchBlockChainErrors } from "../../usg/record/usg_record_controller"
import { doMerge, getMergeFormState } from "./rstan_merge_controller"
import { useNextEndLockTime } from "../use_next_end_lock_time"
import { PERMA_LOCK_END_TIME } from "../rs_tan_repository"

type VsTanMergeContextProps = {
  children: ReactNode
}

type VsTanMergeContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  formState: FormState

  firstPositionToMerge: string
  setFirstPositionToMerge: (arg: string) => void

  secondPositionToMerge: string
  setSecondPositionToMerge: (arg: string) => void

  claimAsSUSG: boolean
  setClaimAsSUSG: (arg: boolean) => void

  actionMerge: () => void

  computedNewPositionId: string

  firstPositionToMergeInfo: LockPosition | undefined

  secondPositionToMergeInfo: LockPosition | undefined

  computedNewUnlockDate: string

  // vsTAN of the surviving position once both balances are added together
  computedNewAmount: bigint
}

export const VsTanMergeContext = createContext<VsTanMergeContextValues | undefined>(undefined)

const toastErrorMapper = (err: unknown) => {
  const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
  return { type: "Error" as const, content: error || "Unable to proceed with the transaction." }
}

export const VsTanMergeProvider = ({ children }: VsTanMergeContextProps) => {
  const { walletClient, isWellConnected } = useWalletConnexionContext()

  const { loadData, lockData } = useVsTanContext()

  const { chainTimestamp } = useNextEndLockTime(lockData)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [claimAsSUSG, setClaimAsSUSG] = useState<boolean>(false)

  const [firstPositionToMerge, setFirstPositionToMerge] = useState<string>("")

  const [secondPositionToMerge, setSecondPositionToMerge] = useState<string>("")

  const firstPositionToMergeInfo = useMemo(() => {
    const pos = lockData?.positions.find((position) => position?.tokenId.toString() === firstPositionToMerge)

    return pos
  }, [firstPositionToMerge, lockData])

  const secondPositionToMergeInfo = useMemo(() => {
    const pos = lockData?.positions.find((position) => position?.tokenId.toString() === secondPositionToMerge)

    return pos
  }, [secondPositionToMerge, lockData])

  const computedNewPositionId = useMemo(() => {
    if (!lockData || !lockData.positions || lockData.positions.length === 0) {
      return "001"
    }

    const maxTokenId = lockData.positions.reduce((max, position) => {
      const tokenIdNumber = Number(position.tokenId)
      return tokenIdNumber > max ? tokenIdNumber : max
    }, 0)

    const newPositionId1 = (maxTokenId + 1).toString()

    return newPositionId1
  }, [lockData, firstPositionToMerge])

  const formState = useMemo(
    () => getMergeFormState(firstPositionToMergeInfo, secondPositionToMergeInfo, chainTimestamp, isWellConnected),
    [firstPositionToMergeInfo, secondPositionToMergeInfo, chainTimestamp, isWellConnected]
  )

  const computedNewAmount = useMemo(
    () => (firstPositionToMergeInfo?.amount ?? 0n) + (secondPositionToMergeInfo?.amount ?? 0n),
    [firstPositionToMergeInfo, secondPositionToMergeInfo]
  )

  const computedNewUnlockDate = useMemo(() => {
    if (!firstPositionToMergeInfo || !secondPositionToMergeInfo) return PERMA_LOCK_END_TIME

    return firstPositionToMergeInfo?.endLockTime > secondPositionToMergeInfo?.endLockTime
      ? firstPositionToMergeInfo?.endLockTime
      : secondPositionToMergeInfo?.endLockTime
  }, [firstPositionToMergeInfo, secondPositionToMergeInfo])

  const actionMerge = async () => {
    if (isLoading || !walletClient || !firstPositionToMergeInfo || !secondPositionToMergeInfo) return

    setIsLoading(true)

    try {
      await toastTx(doMerge(walletClient, firstPositionToMergeInfo?.tokenId, secondPositionToMergeInfo?.tokenId, claimAsSUSG), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({ type: "Success", content: "Positions successfully merged." }),
        error: toastErrorMapper,
      })

      loadData()
      setSecondPositionToMerge("")
      setFirstPositionToMerge("")
    } catch {
      // toastTx already surfaced the failure
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: VsTanMergeContextValues = {
    isLoading,
    setIsLoading,
    actionMerge,
    firstPositionToMerge,
    setFirstPositionToMerge,
    secondPositionToMerge,
    setSecondPositionToMerge,
    firstPositionToMergeInfo,
    secondPositionToMergeInfo,
    computedNewPositionId,
    computedNewUnlockDate,
    computedNewAmount,
    formState,
    claimAsSUSG,
    setClaimAsSUSG,
  }

  return <VsTanMergeContext.Provider value={contextValue}>{children}</VsTanMergeContext.Provider>
}

export const useVsTanMergeContext = () => {
  const context = useContext(VsTanMergeContext)
  if (!context) {
    throw new Error("useVsTanMergeContext must be used within a VsTanMergeProvider")
  }
  return context
}
