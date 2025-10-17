"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { useVsTanContext } from "../rstan_layout_context"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { doClaim } from "./rstan_claim_controller"

type RsTanClaimContextProps = {
  children: ReactNode
}

type RsTanClaimContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  claimAsSUSG: boolean
  setClaimAsSUSG: (arg: boolean) => void

  selectedPositions: string[]
  setSelectedPositions: (arg: string[]) => void

  actionClaim: () => void

  selectedPositionsData: LockPosition[]

  hasDuplicates: boolean
}

export const RsTanClaimContext = createContext<RsTanClaimContextValues | undefined>(undefined)

export const RsTanClaimProvider = ({ children }: RsTanClaimContextProps) => {
  const { getWalletClient } = useWalletConnexionContext()

  const { loadData, lockData } = useVsTanContext()

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
  }, [selectedPositions])

  const actionClaim = async () => {
    setIsLoading(true)
    const walletClient = getWalletClient()

    if (walletClient) {
      const positionsToClaim = selectedPositionsData?.filter((pos) => pos.claimable !== 0n)

      await doClaim(positionsToClaim, walletClient, claimAsSUSG)
      loadData()
      setSelectedPositions([])
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }

  const contextValue: RsTanClaimContextValues = {
    isLoading,
    setIsLoading,
    actionClaim,
    selectedPositions,
    setSelectedPositions,
    selectedPositionsData,
    claimAsSUSG,
    setClaimAsSUSG,
    hasDuplicates,
  }

  return <RsTanClaimContext.Provider value={contextValue}>{children}</RsTanClaimContext.Provider>
}

export const useRsTanClaimContext = () => {
  const context = useContext(RsTanClaimContext)
  if (!context) {
    throw new Error("useRsTanClaimContext must be used within a RsTanClaimProvider")
  }
  return context
}
