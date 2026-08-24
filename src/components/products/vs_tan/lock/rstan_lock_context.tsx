"use client"

import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { useVsTanContext } from "../rstan_layout_context"
import { isPermaLocked } from "../rstan_layout_controller"
import { useNextEndLockTime } from "../use_next_end_lock_time"
import { FormState, LockPosition } from "../../usg/usg_type"
import { toastTx } from "@/components/design_system/toast"
import { matchBlockChainErrors } from "../../usg/record/usg_record_controller"
import { formatDate } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { AssetDataPriced } from "@/types"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { doApprove, doIncreaseLockAmount, doLock, getLockFormState } from "./rstan_lock_controller"
import { useMinLock } from "../use_min_lock"
import { TAN_PRICE_DECIMALS } from "../tan_price"
import { IconInfinity } from "@/components/icons/icon_infinity"

type VsTanLockContextProps = {
  children: ReactNode
}

type VsTanLockContextValues = {
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

  computedNewEndLockDate: ReactNode

  handleDepositChange: (arg: bigint | undefined) => void

  depositAssetInfo: AssetDataPriced

  maxAmountToDeposit: string

  maxDepositWeiValue: bigint
}

export const VsTanLockContext = createContext<VsTanLockContextValues | undefined>(undefined)

const toastErrorMapper = (err: unknown) => {
  const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
  return { type: "Error" as const, content: error || "Unable to proceed with the transaction." }
}

export const VsTanLockProvider = ({ children }: VsTanLockContextProps) => {
  const { walletClient, isWellConnected, currentAddress } = useWalletConnexionContext()

  const { loadData, lockData } = useVsTanContext()

  const { nextEndLockTime, chainTimestamp } = useNextEndLockTime(lockData)

  const minLock = useMinLock()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isPermaLock, setIsPermaLock] = useState<boolean>(false)

  const [depositWeiValue, setDepositWeiValue] = useState<bigint | undefined>()

  const [depositPosition, setDepositPosition] = useState<string>("New")

  const depositPositionInfo = useMemo(() => {
    if (depositPosition === "New") {
      return { amount: 0n, claimable: 0n, endLockTime: "", tokenId: 0n }
    }

    return lockData?.positions.find((position) => position?.tokenId.toString() === depositPosition)
  }, [depositPosition, lockData])

  // The perma lock switch only drives the creation of a new position : an existing one is toggled from the positions list
  useEffect(() => {
    if (depositPosition !== "New") {
      setIsPermaLock(false)
    }
  }, [depositPosition])

  // Locking only ever takes TAN
  const depositAssetInfo = useMemo<AssetDataPriced>(
    () => ({
      symbol: "TAN",
      name: "TAN",
      decimals: 18,
      address: VSTAN_CONTRACT?.TAN,
      displayDecimals: 5,
      price: Number(formatBigInt(lockData?.tanPrice, TAN_PRICE_DECIMALS, 6)),
    }),
    [lockData]
  )

  const actionApprove = async () => {
    if (isLoading || !walletClient || !depositWeiValue) return

    setIsLoading(true)

    try {
      await toastTx(doApprove(walletClient, VSTAN_CONTRACT.TAN, VSTAN_CONTRACT.VSTAN, depositWeiValue), {
        pending: { type: "Pending Transaction", content: "Waiting for approval confirmation..." },
        success: () => ({ type: "Success", content: "TAN approved successfully." }),
        error: toastErrorMapper,
      })

      loadData()
    } catch {
      // toastTx already surfaced the failure
    } finally {
      setIsLoading(false)
    }
  }

  const actionLock = async () => {
    if (isLoading || !walletClient || !depositWeiValue) return

    const isIncrease = !!depositPositionInfo && depositPositionInfo?.tokenId !== 0n

    setIsLoading(true)

    try {
      await toastTx(
        isIncrease ? doIncreaseLockAmount(depositPositionInfo!.tokenId, depositWeiValue, walletClient) : doLock(depositWeiValue, walletClient, isPermaLock),
        {
          pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
          success: () => ({
            type: "Success",
            content: isIncrease ? "Successfully increased lock position." : "Successfully created lock position.",
          }),
          error: toastErrorMapper,
        }
      )

      loadData()
      setDepositWeiValue(undefined)
    } catch {
      // toastTx already surfaced the failure
    } finally {
      setIsLoading(false)
    }
  }

  const lockBalanceAllowanceData = useMemo(() => {
    if (!lockData) return { balance: 0n, allowance: 0n }

    return { balance: lockData?.balance, allowance: lockData?.allowance }
  }, [lockData])

  // TAN balance : drives the slider and the max button
  const maxDepositWeiValue = useMemo(() => lockBalanceAllowanceData?.balance ?? 0n, [lockBalanceAllowanceData])

  const formState = useMemo<FormState>(
    () => getLockFormState(lockBalanceAllowanceData, depositPositionInfo, depositWeiValue, isWellConnected, depositPosition === "New", minLock, chainTimestamp),
    [lockBalanceAllowanceData, depositPositionInfo, depositWeiValue, isWellConnected, depositPosition, minLock, chainTimestamp]
  )

  const computedNewLockValue = useMemo(() => {
    const baseValue = depositPositionInfo?.amount ? depositPositionInfo?.amount : 0n

    return formatBigInt((depositWeiValue || 0n) + baseValue, 18, 2)
  }, [depositPositionInfo, depositWeiValue])

  // A new position is perma locked through the form switch, an existing one through its own endLockTime
  const isTargetPermaLocked = useMemo(() => {
    if (depositPosition === "New") return isPermaLock

    return isPermaLocked(depositPositionInfo)
  }, [depositPosition, isPermaLock, depositPositionInfo])

  // Date a lock created or extended right now would unlock on
  const prospectiveEndLockDate = useMemo(() => {
    // Perma locked positions never unlock, and increaseLockAmount doesn't lift the perma lock
    if (isTargetPermaLocked) return <IconInfinity className="h-4 w-auto" />

    if (!nextEndLockTime) return "-"

    return formatDate(new Date(Number(nextEndLockTime) * 1000), "dd/MM/yyyy")
  }, [isTargetPermaLocked, nextEndLockTime])

  const currentEndLockDate = useMemo(() => {
    // A new position has no unlock date to evolve from : show the one it would get instead of an empty value
    if (!depositPositionInfo?.endLockTime) return prospectiveEndLockDate

    if (isPermaLocked(depositPositionInfo)) return <IconInfinity className="h-4 w-auto" />

    return formatDate(new Date(Number(depositPositionInfo?.endLockTime) * 1000), "dd/MM/yyyy")
  }, [depositPositionInfo, prospectiveEndLockDate])

  const computedNewEndLockDate = useMemo(() => {
    // Without a deposit nothing gets locked, so the unlock date doesn't move
    if (!depositWeiValue) return currentEndLockDate

    // Both createLock and increaseLockAmount reset the lock to its full duration
    return prospectiveEndLockDate
  }, [depositWeiValue, prospectiveEndLockDate, currentEndLockDate])

  const handleDepositChange = (value: bigint | undefined) => {
    setDepositWeiValue(value)
  }

  const maxAmountToDeposit = useMemo(() => {
    if (lockData && currentAddress) {
      // Same source as the slider and the max button, so the label can't disagree with them
      return `Max : ${formatBigInt(maxDepositWeiValue, depositAssetInfo?.decimals, 2)} ${depositAssetInfo?.symbol}`
    }
    return ""
  }, [depositAssetInfo, lockData, maxDepositWeiValue, currentAddress])

  const contextValue: VsTanLockContextValues = {
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
    computedNewEndLockDate,
    setIsPermaLock,
    isPermaLock,
    handleDepositChange,
    depositAssetInfo,
    maxAmountToDeposit,
    maxDepositWeiValue,
  }

  return <VsTanLockContext.Provider value={contextValue}>{children}</VsTanLockContext.Provider>
}

export const useVsTanLockContext = () => {
  const context = useContext(VsTanLockContext)
  if (!context) {
    throw new Error("useVsTanLockContext must be used within a VsTanLockProvider")
  }
  return context
}
