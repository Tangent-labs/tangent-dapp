"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useVsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { LockPosition } from "../../usg/usg_type"
import { doMerge, getMergeFormState } from "./rstan_merge_controller"
import { FormState } from "@/types"

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
}

export const VsTanMergeContext = createContext<VsTanMergeContextValues | undefined>(undefined)

export const VsTanMergeProvider = ({ children }: VsTanMergeContextProps) => {
  const { getWalletClient } = useWalletConnexionContext()

  const { loadData, lockData } = useVsTanContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [claimAsSUSG, setClaimAsSUSG] = useState<boolean>(false)

  const [firstPositionToMerge, setFirstPositionToMerge] = useState<string>("")

  const [secondPositionToMerge, setSecondPositionToMerge] = useState<string>("")

  const firstPositionToMergeInfo = useMemo(() => {
    const pos = lockData?.positions.find((position) => position?.tokenId.toString() === firstPositionToMerge)

    return pos
  }, [firstPositionToMerge])

  const secondPositionToMergeInfo = useMemo(() => {
    const pos = lockData?.positions.find((position) => position?.tokenId.toString() === secondPositionToMerge)

    return pos
  }, [secondPositionToMerge])

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

  const formState = useMemo(() => {
    if (!firstPositionToMergeInfo || !secondPositionToMergeInfo) return { canProcess: false, cantProcessReasons: [], haveToApprove: false }

    return getMergeFormState(firstPositionToMergeInfo, secondPositionToMergeInfo)
  }, [firstPositionToMergeInfo, secondPositionToMergeInfo])

  const computedNewUnlockDate = useMemo(() => {
    if (!firstPositionToMergeInfo || !secondPositionToMergeInfo) return "281474976710655"

    return firstPositionToMergeInfo?.endLockTime > secondPositionToMergeInfo?.endLockTime
      ? firstPositionToMergeInfo?.endLockTime
      : secondPositionToMergeInfo?.endLockTime
  }, [firstPositionToMergeInfo, secondPositionToMergeInfo])

  const actionMerge = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()
    if (walletClient && firstPositionToMergeInfo && secondPositionToMergeInfo) {
      await doMerge(walletClient, firstPositionToMergeInfo?.tokenId, secondPositionToMergeInfo?.tokenId, claimAsSUSG)
      loadData()
      setSecondPositionToMerge("")
      setFirstPositionToMerge("")
      setIsLoading(false)
    } else {
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
