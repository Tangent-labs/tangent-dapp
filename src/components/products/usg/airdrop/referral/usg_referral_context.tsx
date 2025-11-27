"use client"

import { Address } from "viem"
import { useUSGContext } from "../../usg_context"
import { getGodsonsLeaderboard } from "../../client_api"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import { GodsonLeaderboard, Leaderboard } from "../../usg_type"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export type UserStatus = {
  generatedCode: string | null
  hasUsedCode: boolean
  referralCode: string | null
  friends: number
}

type UsgReferralCodeContextProps = {
  children: ReactNode
  lpLeaderboard: Leaderboard
  voteLeaderboard: Leaderboard
  code: string | undefined
}

type UsgReferralCodeContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void
  lpLeaderboard: Leaderboard
  voteLeaderboard: Leaderboard
  godsonsLeaderboard: GodsonLeaderboard
}

export const UsgReferralCodeContext = createContext<UsgReferralCodeContextValues | undefined>(undefined)

export const UsgReferralCodeProvider = ({ children, code, lpLeaderboard, voteLeaderboard }: UsgReferralCodeContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const { refetchPoints } = useUSGContext()

  const { setReferralStatus, referralStatus } = useUsgAirdropContext()

  useEffect(() => {
    if (code) {
      setReferralStatus({
        ...referralStatus,
        referralCode: code,
      })
    }
  }, [code])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [godsonsLeaderboard, setGodsonsLeaderboard] = useState<
    Array<{
      rank: number
      address: Address
      lpPoints: number
      votePts: number
    }>
  >([])

  useEffect(() => {
    if (currentAddress) {
      getGodsonsLeaderboard(currentAddress).then((l) => {
        setGodsonsLeaderboard(l)
      })

      refetchPoints()
    }
  }, [currentAddress])

  const contextValue: UsgReferralCodeContextValues = {
    isLoading,
    setIsLoading,
    godsonsLeaderboard,
    lpLeaderboard,
    voteLeaderboard,
  }

  return <UsgReferralCodeContext.Provider value={contextValue}>{children}</UsgReferralCodeContext.Provider>
}

export const useUsgReferralCodeContext = () => {
  const context = useContext(UsgReferralCodeContext)
  if (!context) {
    throw new Error("useUsgReferralCodeContext must be used within a UsgReferralCodeProvider")
  }
  return context
}
