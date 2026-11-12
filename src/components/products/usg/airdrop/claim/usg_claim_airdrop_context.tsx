"use client"

import { Address } from "viem"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import {
  AirdropAllocationResponse,
  AirdropCategoryAllocation,
  AirdropCategoryDistribution,
  AirdropRecipient,
  AirdropSummary,
  buildCategoryAllocations,
  buildDistribution,
} from "./usg_claim_airdrop_controller"

export type ClaimStatus = "idle" | "claiming" | "claimed"

type UsgClaimAirdropContextProps = {
  children: ReactNode
  /** Dev only: display the page as if this wallet was connected */
  previewAddress?: Address
  /** Dev only: force the claim status */
  previewStatus?: ClaimStatus
}

type UsgClaimAirdropContextValues = {
  isLoading: boolean
  isConnected: boolean
  address?: Address
  summary: AirdropSummary | null
  recipient: AirdropRecipient | null
  allocations: AirdropCategoryAllocation[]
  distribution: AirdropCategoryDistribution[]
  totalAmount: number
  claimStatus: ClaimStatus
  claimAll: () => Promise<void>
  connect: () => void
}

const UsgClaimAirdropContext = createContext<UsgClaimAirdropContextValues | undefined>(undefined)

const fetchAirdropAllocation = async (user?: Address): Promise<AirdropAllocationResponse | null> => {
  try {
    const response = await fetch(`/api/airdrop${user ? `?user=${user}` : ""}`)
    if (!response.ok) throw new Error(`Airdrop API error: ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch airdrop allocation:", error)
    return null
  }
}

export const UsgClaimAirdropProvider = ({ children, previewAddress, previewStatus }: UsgClaimAirdropContextProps) => {
  const { currentAddress, isConnected: isWalletConnected, connect } = useWalletConnexionContext()

  const address = previewAddress ?? (isWalletConnected ? currentAddress : undefined)
  const isConnected = !!address

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [summary, setSummary] = useState<AirdropSummary | null>(null)
  const [recipient, setRecipient] = useState<AirdropRecipient | null>(null)
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>(previewStatus ?? "idle")

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setClaimStatus(previewStatus ?? "idle")

    fetchAirdropAllocation(address).then((data) => {
      if (cancelled) return
      setSummary(data?.summary ?? null)
      setRecipient(data?.recipient ?? null)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [address, previewStatus])

  const allocations = useMemo(() => (summary ? buildCategoryAllocations(recipient?.details, summary) : []), [summary, recipient])
  const distribution = useMemo(() => (summary ? buildDistribution(summary) : []), [summary])
  const totalAmount = useMemo(() => allocations.reduce((acc, c) => acc + c.amount, 0), [allocations])

  const claimAll = async () => {
    if (!recipient || claimStatus !== "idle") return

    setClaimStatus("claiming")
    try {
      // TODO: wire the TAN merkle distributor once deployed: airdrop.json has no merkle proofs and no claim contract exists yet.
      // Expected flow: write `claim(account, amount, proof)` with walletClient, wait for the receipt, then set "claimed".
      // The "claimed" status should also be read on-chain on load (e.g. `isClaimed(account)`).
      throw new Error("Airdrop claim contract is not available yet")
    } catch (error) {
      console.error(error)
      toast.error(ToastComponent, { data: { type: "Error", content: "Claim failed. Please try again later." } })
      setClaimStatus("idle")
    }
  }

  const contextValue: UsgClaimAirdropContextValues = {
    isLoading,
    isConnected,
    address,
    summary,
    recipient,
    allocations,
    distribution,
    totalAmount,
    claimStatus,
    claimAll,
    connect,
  }

  return <UsgClaimAirdropContext.Provider value={contextValue}>{children}</UsgClaimAirdropContext.Provider>
}

export const useUsgClaimAirdropContext = () => {
  const context = useContext(UsgClaimAirdropContext)
  if (!context) {
    throw new Error("useUsgClaimAirdropContext must be used within a UsgClaimAirdropProvider")
  }
  return context
}
