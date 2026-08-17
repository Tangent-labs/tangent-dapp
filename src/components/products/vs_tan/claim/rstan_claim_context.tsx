"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useVsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { FormState, LockPosition } from "../../usg/usg_type"
import { toastTx } from "@/components/design_system/toast"
import { matchBlockChainErrors } from "../../usg/record/usg_record_controller"
import { useUSGContext } from "../../usg/usg_context"
import { formatDollar } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { doClaim, getClaimFormState, getSUsgShares, totalClaimable } from "./rstan_claim_controller"

type VsTanClaimContextProps = {
  children: ReactNode
}

type VsTanClaimContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  claimAsSUSG: boolean
  setClaimAsSUSG: (arg: boolean) => void

  selectedPositions: string[]
  setSelectedPositions: (arg: string[]) => void

  actionClaim: () => void

  selectedPositionsData: LockPosition[]

  hasDuplicates: boolean

  formState: FormState

  claimableTotal: bigint

  // What the user actually receives : the USG total, or its sUSG share equivalent when the toggle is on
  receivedTotal: bigint

  receivedFor: (position: LockPosition) => bigint

  claimableDollarValue: string
}

export const VsTanClaimContext = createContext<VsTanClaimContextValues | undefined>(undefined)

const toastErrorMapper = (err: unknown) => {
  const error = matchBlockChainErrors(typeof err === "string" ? err : err instanceof Error ? err.message : String(err))
  return { type: "Error" as const, content: error || "Unable to proceed with the transaction." }
}

export const VsTanClaimProvider = ({ children }: VsTanClaimContextProps) => {
  const { walletClient, isWellConnected } = useWalletConnexionContext()

  const { loadData, lockData } = useVsTanContext()

  const { USGsUSGMetrics } = useUSGContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [claimAsSUSG, setClaimAsSUSG] = useState<boolean>(false)

  const [selectedPositions, setSelectedPositions] = useState<string[]>([])

  const hasDuplicates = useMemo(() => {
    const seen = new Set()
    return selectedPositions.some((tokenId) => {
      if (seen.has(tokenId.toString())) return true
      seen.add(tokenId.toString())
      return false
    })
  }, [selectedPositions])

  const selectedPositionsData = useMemo(() => {
    return selectedPositions
      .map((tokenId) => {
        if (!tokenId) return null
        return lockData?.positions.find((pos: LockPosition) => pos.tokenId.toString() === tokenId) || null
      })
      .filter((pos): pos is LockPosition => pos !== null)
  }, [selectedPositions, lockData])

  const claimableTotal = useMemo(() => totalClaimable(selectedPositionsData), [selectedPositionsData])

  const claimableDollarValue = useMemo(() => {
    const usgPrice = USGsUSGMetrics?.USGPrice

    if (!usgPrice || !claimableTotal) return ""

    // Rewards accrue in USG whichever token is received : claiming as sUSG deposits the same value
    return formatDollar(formatUnits((claimableTotal * usgPrice) / 10n ** 18n, 18), 2)
  }, [claimableTotal, USGsUSGMetrics])

  const [sUsgShares, setSUsgShares] = useState<bigint>(0n)

  useEffect(() => {
    if (!claimAsSUSG || !claimableTotal) {
      setSUsgShares(0n)
      return
    }

    getSUsgShares(claimableTotal)
      .then(setSUsgShares)
      .catch((error) => {
        // Fall back to showing the USG figure rather than a wrong one
        setSUsgShares(0n)
        console.error("Failed to convert the claimable amount to sUSG shares:", error)
      })
  }, [claimAsSUSG, claimableTotal])

  const receivedTotal = useMemo(() => (claimAsSUSG && sUsgShares ? sUsgShares : claimableTotal), [claimAsSUSG, sUsgShares, claimableTotal])

  // Same conversion ratio applied per position, so the recap adds up to the total
  const receivedFor = (position: LockPosition) =>
    claimAsSUSG && sUsgShares && claimableTotal ? (position.claimable * sUsgShares) / claimableTotal : position.claimable

  const formState = useMemo<FormState>(
    () => getClaimFormState(selectedPositionsData, hasDuplicates, isWellConnected),
    [selectedPositionsData, hasDuplicates, isWellConnected]
  )

  const actionClaim = async () => {
    if (isLoading || !walletClient) return

    const positionsToClaim = selectedPositionsData?.filter((pos) => pos.claimable !== 0n)

    setIsLoading(true)

    try {
      await toastTx(doClaim(positionsToClaim, walletClient, claimAsSUSG), {
        pending: { type: "Pending Transaction", content: "Blockchain transaction in progress..." },
        success: () => ({ type: "Success", content: `Rewards claimed as ${claimAsSUSG ? "sUSG" : "USG"}.` }),
        error: toastErrorMapper,
      })

      loadData()
      setSelectedPositions([])
    } catch {
      // toastTx already surfaced the failure
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: VsTanClaimContextValues = {
    isLoading,
    setIsLoading,
    actionClaim,
    selectedPositions,
    setSelectedPositions,
    selectedPositionsData,
    claimAsSUSG,
    setClaimAsSUSG,
    formState,
    claimableTotal,
    receivedTotal,
    receivedFor,
    claimableDollarValue,
    hasDuplicates,
  }

  return <VsTanClaimContext.Provider value={contextValue}>{children}</VsTanClaimContext.Provider>
}

export const useVsTanClaimContext = () => {
  const context = useContext(VsTanClaimContext)
  if (!context) {
    throw new Error("useVsTanClaimContext must be used within a VsTanClaimProvider")
  }
  return context
}
