"use client"

import { Address } from "viem"
import { toast } from "react-toastify"
import { useUSGContext } from "../tg_usd_context"
import { getCurrentBlock } from "@/services/service_rpc"
import { ToastComponent } from "@/components/design_system/toast"
import { generateCode, getGodsonsLeaderboard, getReferralStatus, validateReferralCode } from "../api"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { GodsonLeaderboard, Leaderboard } from "../tg_usd_type"

export type UserStatus = {
  generatedCode: string | null
  hasUsedCode: boolean
  referralCode: string | null
  friends: number
}

type UsgReferralCodeContextProps = {
  children: ReactNode
  code: string | undefined
  lpLeaderboard: Leaderboard
  voteLeaderboard: Leaderboard
}

type UsgReferralCodeContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void
  signMessage: () => void
  generateReferralCode: () => void
  referralStatus: UserStatus
  setReferralStatus: (arg: UserStatus) => void
  code: string | undefined
  lpLeaderboard: Leaderboard
  voteLeaderboard: Leaderboard
  godsonsLeaderboard: GodsonLeaderboard
}

export const UsgReferralCodeContext = createContext<UsgReferralCodeContextValues | undefined>(undefined)

export const UsgReferralCodeProvider = ({ children, code, lpLeaderboard, voteLeaderboard }: UsgReferralCodeContextProps) => {
  const { currentAddress, getWalletClient } = useWalletConnexionContext()

  const { refetchPoints } = useUSGContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [godsonsLeaderboard, setGodsonsLeaderboard] = useState<
    Array<{
      rank: number
      address: Address
      lpPoints: number
      votePts: number
    }>
  >([])

  const [referralStatus, setReferralStatus] = useState<UserStatus>({ generatedCode: null, hasUsedCode: false, referralCode: "", friends: 0 })

  useEffect(() => {
    if (code) {
      setReferralStatus({ ...referralStatus, referralCode: code })
    }
  }, [code])

  useEffect(() => {
    if (currentAddress) {
      getReferralStatus(currentAddress).then((status) => {
        if (status) {
          setReferralStatus((prev) => ({
            ...prev,
            generatedCode: status.referralCode ?? null,
            hasUsedCode: !!status.hasUsedCode,
            friends: status.friends ?? 0,
          }))
        }
      })

      getGodsonsLeaderboard(currentAddress).then((l) => {
        setGodsonsLeaderboard(l)
      })

      refetchPoints()
    }
  }, [currentAddress])

  const generateReferralCode = async () => {
    generateCode(currentAddress!).then((code) => {
      setReferralStatus({ ...referralStatus, generatedCode: code })
    })
  }

  const signMessage = async () => {
    if (!referralStatus?.referralCode) {
      return
    }

    setIsLoading(true)

    try {
      const walletClient = getWalletClient()

      const message = `I am using the following referral code ${referralStatus?.referralCode}`

      if (walletClient && currentAddress) {
        // Sign the message
        const signature = await walletClient.signMessage({
          account: currentAddress,
          message,
        })

        const currentBlock = await getCurrentBlock()
        const now = new Date(Number(currentBlock.timestamp) * 1000).toISOString()

        validateReferralCode(referralStatus?.referralCode, signature, currentAddress, now)
          .then((resp) => {
            if (resp?.error) {
              toast.error(ToastComponent, { data: { type: "Error", content: "Referral process failed." } })
            }

            if (resp?.message === "Referral successfully processed") {
              toast.success(ToastComponent, { data: { type: "Success", content: resp?.message } })
              setReferralStatus({ ...referralStatus, hasUsedCode: true })
            }
          })
          .catch((error) => {
            console.error("error : ", error)
          })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: UsgReferralCodeContextValues = {
    isLoading,
    setIsLoading,
    signMessage,
    generateReferralCode,
    referralStatus,
    setReferralStatus,
    code,
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
