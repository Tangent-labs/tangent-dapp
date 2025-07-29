"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { generateCode, getReferralStatus, validateReferralCode } from "../api"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"

export type UserStatus = {
  generatedCode: string | null
  hasUsedCode: boolean
  referralCode: string | null
  friends: number
}

type UsgReferralCodeContextProps = {
  children: ReactNode
}

type UsgReferralCodeContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  message: string
  setMessage: (arg: string) => void

  signMessage: () => void

  generateReferralCode: () => void

  referralStatus: UserStatus
  setReferralStatus: (arg: UserStatus) => void
}

export const UsgReferralCodeContext = createContext<UsgReferralCodeContextValues | undefined>(undefined)

export const UsgReferralCodeProvider = ({ children }: UsgReferralCodeContextProps) => {
  const { currentAddress, getWalletClient } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [referralStatus, setReferralStatus] = useState<UserStatus>({ generatedCode: null, hasUsedCode: false, referralCode: "", friends: 0 })

  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    if (currentAddress) {
      getReferralStatus(currentAddress).then((status) => {
        if (status) {
          setReferralStatus({ ...referralStatus, generatedCode: status?.referralCode, hasUsedCode: status?.hasUsedCode, friends: status?.friends })
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

    setIsLoading(true)

    try {
      const walletClient = getWalletClient()

      if (walletClient && currentAddress) {
        // Sign the message
        const signature = await walletClient.signMessage({
          account: currentAddress,
          message,
        })

        validateReferralCode(referralStatus?.referralCode, signature, currentAddress)
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
    message,
    setMessage,
    signMessage,
    generateReferralCode,
    referralStatus,
    setReferralStatus,
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
