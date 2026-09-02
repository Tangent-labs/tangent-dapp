"use client"

import {
  doKickPosition,
  doUnlock,
  getKickBounty,
  getKickParams,
  getUnlockFormState,
  getUnlockMode,
  getUnlockPreview,
  KickParams,
  UnlockMode,
} from "./rstan_unlock_controller"
import { FormState, LockPosition } from "../../usg/usg_type"
import { useVsTanContext } from "../rstan_layout_context"
import { useNextEndLockTime } from "../use_next_end_lock_time"
import { doTogglePermaLock } from "../rstan_layout_controller"
import { toastTx } from "@/components/design_system/toast"
import { matchBlockChainErrors } from "../../usg/record/usg_record_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

type VsTanUnlockContextProps = {
  children: ReactNode
}

type VsTanUnlockContextValues = {
  isLoading: boolean

  unlockPosition: string
  setUnlockPosition: (arg: string) => void

  unlockPositionInfo: LockPosition | undefined

  mode: UnlockMode

  formState: FormState

  tanReceived: bigint
  tanForfeited: bigint

  claimAsSUSG: boolean
  setClaimAsSUSG: (arg: boolean) => void

  kickParams: KickParams | undefined
  kickablePositions: { position: LockPosition; bounty: bigint }[]

  actionProcess: () => void
  actionKick: (tokenId: bigint) => void
}

export const VsTanUnlockContext = createContext<VsTanUnlockContextValues | undefined>(undefined)

const toastErrorMapper = (err: unknown) => {
  const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
  return { type: "Error" as const, content: error || "Unable to proceed with the transaction." }
}

export const VsTanUnlockProvider = ({ children }: VsTanUnlockContextProps) => {
  const { walletClient, isWellConnected, currentAddress } = useWalletConnexionContext()

  const { loadData, lockData } = useVsTanContext()

  const { chainTimestamp } = useNextEndLockTime(lockData)

  // The contract compares against block.timestamp. A local fork can run days behind the wall clock,
  // which would misclassify positions and — worse — misquote the early-exit penalty.
  // Date.now() is only a stand-in for the one round trip before the block is read.
  const nowSec = Number(chainTimestamp ?? BigInt(Math.floor(Date.now() / 1000)))

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [claimAsSUSG, setClaimAsSUSG] = useState<boolean>(false)

  const [unlockPosition, setUnlockPosition] = useState<string>("")

  const [kickParams, setKickParams] = useState<KickParams | undefined>(undefined)

  useEffect(() => {
    getKickParams().then(setKickParams)
  }, [])

  const unlockPositionInfo = useMemo(() => {
    return lockData?.positions.find((position) => position?.tokenId.toString() === unlockPosition)
  }, [unlockPosition, lockData])

  const mode = useMemo(() => {
    return getUnlockMode(unlockPositionInfo, nowSec, kickParams)
  }, [unlockPositionInfo, kickParams, nowSec])

  const formState = useMemo(() => {
    return getUnlockFormState(isWellConnected, mode)
  }, [isWellConnected, mode])

  const { tanReceived, tanForfeited } = useMemo(() => {
    return getUnlockPreview(unlockPositionInfo, mode, nowSec * 1000)
  }, [unlockPositionInfo, mode, nowSec])

  const kickablePositions = useMemo(() => {
    if (!kickParams) return []

    return (lockData?.positions || [])
      .filter((position) => getUnlockMode(position, nowSec, kickParams) === "kickable")
      .map((position) => ({ position, bounty: getKickBounty(position.amount, kickParams.percentage) }))
  }, [lockData, kickParams, nowSec])

  const actionProcess = async () => {
    if (isLoading || !formState.canProcess || !walletClient || !unlockPositionInfo) return

    try {
      setIsLoading(true)

      const tokenId = unlockPositionInfo.tokenId

      const promise =
        mode === "perma" ? doTogglePermaLock(tokenId, walletClient) : doUnlock(walletClient, tokenId, mode === "locked" ? "rageQuit" : "unlock", claimAsSUSG)

      const successContent =
        mode === "perma"
          ? "Perma-lock removed — the position reverts to a 13-week lock."
          : mode === "locked"
            ? "Position exited early; the remaining-duration penalty was applied."
            : "Position unlocked."

      await toastTx(promise, {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({ type: "Success", content: successContent }),
        error: toastErrorMapper,
      })

      loadData()
      setUnlockPosition("")
      setClaimAsSUSG(false)
    } catch {
      // toastTx already surfaced the failure
    } finally {
      setIsLoading(false)
    }
  }

  const actionKick = async (tokenId: bigint) => {
    if (isLoading || !walletClient || !currentAddress) return

    try {
      setIsLoading(true)

      await toastTx(doKickPosition(walletClient, tokenId, currentAddress), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({ type: "Success", content: "Position kicked; the bounty was sent to your wallet." }),
        error: toastErrorMapper,
      })

      loadData()

      if (unlockPosition === tokenId.toString()) setUnlockPosition("")
    } catch {
      // toastTx already surfaced the failure
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: VsTanUnlockContextValues = {
    isLoading,
    unlockPosition,
    setUnlockPosition,
    unlockPositionInfo,
    mode,
    formState,
    tanReceived,
    tanForfeited,
    claimAsSUSG,
    setClaimAsSUSG,
    kickParams,
    kickablePositions,
    actionProcess,
    actionKick,
  }

  return <VsTanUnlockContext.Provider value={contextValue}>{children}</VsTanUnlockContext.Provider>
}

export const useVsTanUnlockContext = () => {
  const context = useContext(VsTanUnlockContext)
  if (!context) {
    throw new Error("useVsTanUnlockContext must be used within a VsTanUnlockProvider")
  }
  return context
}
