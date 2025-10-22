"use client"

import { toast } from "react-toastify"
import { getCurrentBlock } from "@/services/service_rpc"
import { ToastComponent } from "@/components/design_system/toast"
import { generateCode, getReferralStatus, validateReferralCode } from "../api"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export type UserStatus = {
  generatedCode: string | null
  hasUsedCode: boolean
  referralCode: string | null
  friends: number
}

type UsgAirdropContextProps = {
  children: ReactNode
}

type UsgAirdropContextValues = {
  airdropDataIsLoading: boolean
  setAirdropDataIsLoading: (arg: boolean) => void
  signMessage: () => void
  generateReferralCode: () => void
  referralStatus: UserStatus
  setReferralStatus: (arg: UserStatus) => void
}

export const UsgAirdropContext = createContext<UsgAirdropContextValues | undefined>(undefined)

export const UsgAirdropProvider = ({ children }: UsgAirdropContextProps) => {
  const { currentAddress, getWalletClient } = useWalletConnexionContext()

  const [airdropDataIsLoading, setAirdropDataIsLoading] = useState<boolean>(true)

  const [referralStatus, setReferralStatus] = useState<UserStatus>({ generatedCode: null, hasUsedCode: false, referralCode: "", friends: 0 })

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
          setAirdropDataIsLoading(false)
        }
      })
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

    setAirdropDataIsLoading(true)

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
      setAirdropDataIsLoading(false)
    }
  }

  const contextValue: UsgAirdropContextValues = {
    airdropDataIsLoading,
    setAirdropDataIsLoading,
    signMessage,
    generateReferralCode,
    referralStatus,
    setReferralStatus,
  }

  return <UsgAirdropContext.Provider value={contextValue}>{children}</UsgAirdropContext.Provider>
}

export const useUsgAirdropContext = () => {
  const context = useContext(UsgAirdropContext)
  if (!context) {
    throw new Error("useUsgAirdropContext must be used within a UsgAirdropProvider")
  }
  return context
}
