"use client"

import { Address, zeroAddress } from "viem"
import { useUSGContext } from "../../usg_context"
import { getGodsonsLeaderboard, getLeaderboards } from "../../client_api"
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

export const UsgReferralCodeProvider = ({ children, code }: UsgReferralCodeContextProps) => {
  const { currentAddress, isWalletInitialized } = useWalletConnexionContext()

  const { refetchPoints } = useUSGContext()

  const { setReferralStatus, referralStatus } = useUsgAirdropContext()

  const [lpLeaderboard, setLpLeaderboard] = useState<Leaderboard>([])

  const [voteLeaderboard, setVoteLeaderboard] = useState<Leaderboard>([])

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
    if (code) {
      setReferralStatus({
        ...referralStatus,
        referralCode: code,
      })
    }
  }, [code])

  useEffect(() => {
    if (currentAddress) {
      getGodsonsLeaderboard(currentAddress).then((l) => {
        setGodsonsLeaderboard(l)
      })

      refetchPoints()
    }
  }, [currentAddress])

  const fetchLeaderboards = async (user: Address) => {
    getLeaderboards(user)?.then((res) => {
      setLpLeaderboard(res?.lpLeaderboard)
      setVoteLeaderboard(res?.voteLeaderboard)
    })
  }

  /**
   * On init
   */
  useEffect(() => {
    if (isWalletInitialized) {
      fetchLeaderboards(currentAddress || zeroAddress)
    }
  }, [isWalletInitialized])

  /**
   * On user logs in/logs out
   */
  useEffect(() => {
    if (isWalletInitialized && currentAddress) {
      fetchLeaderboards(currentAddress)
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
