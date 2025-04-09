"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useRsTanContext } from "../rstan_layout_context"
import { doApprove, doIncreaseLockAmount, doLock, getLockFormState } from "./rstan_lock_controller"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { formatBigInt } from "@/lib/number_formatter"
import { FormState } from "@/types"
import { getPublicClient } from "@/services/service_rpc"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"

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

  computedNewEndLockTime: string | null
}

export const RsTanLockContext = createContext<RsTanLockContextValues | undefined>(undefined)

export const RsTanLockProvider = ({ children }: RsTanLockContextProps) => {
  const { getWalletClient, isWellConnected } = useWalletConnexionContext()

  const { loadData, lockData } = useRsTanContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [formState, setFormState] = useState<FormState>({ canProcess: false, cantProcessReasons: [], haveToApprove: false })

  const [isPermaLock, setIsPermaLock] = useState<boolean>(false)

  const [computedNewEndLockTime, setComputedNewEndLockTime] = useState<string | null>(null)

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
    const walletClient = getWalletClient()

    if (walletClient && depositWeiValue) {
      doApprove(depositWeiValue, walletClient)
        .then(() => {
          loadData()
          setIsLoading(false)
        })
        .catch((err) => {
          const errorMessage = err.message.includes("User denied transaction signature") ? "Transaction aborted" : "Something went wrong"
          toast.error(ToastComponent, { data: { content: errorMessage, type: "Error" } })
          setIsLoading(false)
        })
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
        toast.success(ToastComponent, { data: { type: "Success", content: "Successfully increased lock position." } })
      } else {
        await doLock(depositWeiValue, walletClient, isPermaLock)
        loadData()
        setIsLoading(false)
        toast.success(ToastComponent, { data: { type: "Success", content: "Successfully created lock position." } })
      }
    } else {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const computeFormState = async () => {
      if (!lockData || !depositWeiValue) {
        setFormState({ canProcess: false, cantProcessReasons: ["No data"], haveToApprove: false })
      } else {
        getLockFormState(lockData?.balance, lockData?.allowance, depositPositionInfo, depositWeiValue, isWellConnected).then((d) => {
          setFormState(d)
        })
      }
    }

    if (depositPositionInfo) {
      computeFormState()
    }
  }, [depositWeiValue, isWellConnected, lockData, depositPositionInfo])

  const computedNewLockValue = useMemo(() => {
    const baseValue = depositPositionInfo?.amount ? depositPositionInfo?.amount : 0n

    const addedValue = depositWeiValue || 0n

    return formatBigInt(addedValue + baseValue, 18, 2)
  }, [depositPositionInfo, depositWeiValue])

  useEffect(() => {
    const computeEndLockTime = async () => {
      const publicClient = await getPublicClient()
      const currentBlockNumber = await publicClient.getBlockNumber()
      const block = await publicClient.getBlock({ blockNumber: currentBlockNumber })

      const weekId = block.timestamp / 604800n
      const adjustedTime = (weekId + 13n) * 604800n

      setComputedNewEndLockTime(adjustedTime.toString())
    }

    if (depositPositionInfo) {
      computeEndLockTime()
    }
  }, [depositPositionInfo, depositWeiValue])

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
