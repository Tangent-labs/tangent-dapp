"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useRsTanContext } from "../rstan_layout_context"
import { doApprove, doIncreaseLockAmount, doLock, getLockFormState } from "./rstan_lock_controller"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { formatBigInt } from "@/lib/number_formatter"
import { FormState } from "@/types"

type RsTanLockContextProps = {
  children: ReactNode
}

type RsTanLockContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  isPermaLock: boolean
  setIsPermaLock: (arg: boolean) => void

  depositWeiValue?: bigint
  setDepositWeiValue: (arg: bigint | undefined) => void

  depositPositionInfo: LockPosition | undefined

  depositPosition: string
  setDepositPosition: (arg: string) => void

  actionApprove: () => void

  actionLock: () => void

  formState: FormState

  computedNewLockValue: string

  computedNewEndLockTime: string
}

export const RsTanLockContext = createContext<RsTanLockContextValues | undefined>(undefined)

export const RsTanLockProvider = ({ children }: RsTanLockContextProps) => {
  const { getWalletClient, isWellConnected } = useWalletConnexionContext()

  const { loadData, lockData } = useRsTanContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isPermaLock, setIsPermaLock] = useState<boolean>(false)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [depositPosition, setDepositPosition] = useState<string>("New")

  const depositPositionInfo = useMemo(() => {
    if (depositPosition === "New") {
      return { amount: 0n, claimable: 0n, endLockTime: "", tokenId: 0n }
    }

    const pos = lockData?.positions.find((position) => position?.tokenId.toString() === depositPosition)
    setIsPermaLock(false)

    return pos
  }, [depositPosition])

  const actionApprove = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && depositWeiValue) {
      await doApprove(depositWeiValue, walletClient)
      loadData()
      setIsLoading(false)
    }
  }

  const actionLock = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient && depositWeiValue) {
      if (depositPositionInfo && depositPositionInfo?.tokenId !== 0n) {
        await doIncreaseLockAmount(depositPositionInfo?.tokenId, depositWeiValue, walletClient)
        loadData()
        setIsLoading(false)
      } else {
        await doLock(depositWeiValue, walletClient, isPermaLock)
        loadData()
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }

  const formState = useMemo(() => {
    if (!lockData || !depositWeiValue) return { canProcess: false, cantProcessReasons: ["No data"], haveToApprove: false }

    return getLockFormState(lockData?.allowance, depositWeiValue, isWellConnected)
  }, [depositWeiValue, isWellConnected, lockData])

  const computedNewLockValue = useMemo(() => {
    const baseValue = depositPositionInfo?.amount ? depositPositionInfo?.amount : 0n

    const addedValue = depositWeiValue || 0n

    return formatBigInt(addedValue + baseValue, 18, 2)
  }, [depositPositionInfo, depositWeiValue])

  const computedNewEndLockTime = useMemo(() => {
    const thirteenWeeksInSeconds = BigInt(13 * 7 * 24 * 60 * 60)
    const nowInSeconds = BigInt(Math.floor(Date.now() / 1000))

    if (depositPositionInfo?.endLockTime !== undefined) {
      const baseTime = nowInSeconds + thirteenWeeksInSeconds
      const date = new Date(Number(baseTime) * 1000)
      const dayOfWeek = date.getUTCDay()
      const daysSinceThursday = (dayOfWeek - 4 + 7) % 7
      const adjustedTime = baseTime - BigInt(daysSinceThursday * 24 * 60 * 60)
      return adjustedTime.toString()
    } else {
      const result = nowInSeconds + thirteenWeeksInSeconds
      return result.toString()
    }
  }, [depositPositionInfo, depositWeiValue])

  // const computedNewEndLockTime = useMemo(() => {
  //   const thirteenWeeksInSeconds = BigInt(13 * 7 * 24 * 60 * 60)

  //   if (depositPositionInfo && depositPositionInfo?.endLockTime !== "") {
  //     const result = BigInt(depositPositionInfo.endLockTime) + thirteenWeeksInSeconds
  //     return result.toString()
  //   } else {
  //     const nowInSeconds = BigInt(Math.floor(Date.now() / 1000))
  //     const result = nowInSeconds + thirteenWeeksInSeconds
  //     return result.toString()
  //   }
  // }, [depositPositionInfo, depositWeiValue])

  const contextValue: RsTanLockContextValues = {
    isLoading,
    setIsLoading,
    depositWeiValue,
    setDepositWeiValue,
    depositPositionInfo,
    depositPosition,
    setDepositPosition,
    actionApprove,
    actionLock,
    formState,
    computedNewLockValue,
    computedNewEndLockTime,
    setIsPermaLock,
    isPermaLock,
  }

  return <RsTanLockContext.Provider value={contextValue}>{children}</RsTanLockContext.Provider>
}

export const useRsTanLockContext = () => {
  const context = useContext(RsTanLockContext)
  if (!context) {
    throw new Error("useRsTanLockContext must be used within a RsTanLockProvider")
  }
  return context
}
