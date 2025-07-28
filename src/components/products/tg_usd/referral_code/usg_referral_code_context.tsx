"use client"

import { createContext, ReactNode, useContext, useState } from "react"
import { validateReferralCode } from "../api"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { toast } from "react-toastify"
import { ToastComponent } from "@/components/design_system/toast"

type UsgReferralCodeContextProps = {
  children: ReactNode
}

type UsgReferralCodeContextValues = {
  isLoading: boolean
  setIsLoading: (arg: boolean) => void

  referralCode: string
  setReferralCode: (arg: string) => void

  message: string
  setMessage: (arg: string) => void

  signMessage: () => void

  hasBeenReferred: boolean
}

export const UsgReferralCodeContext = createContext<UsgReferralCodeContextValues | undefined>(undefined)

export const UsgReferralCodeProvider = ({ children }: UsgReferralCodeContextProps) => {
  const { currentAddress, getWalletClient } = useWalletConnexionContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [referralCode, setReferralCode] = useState<string>("")
  const [hasBeenReferred, setHasBeenReferred] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")

  const signMessage = async () => {
    if (!referralCode) {
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

        validateReferralCode(referralCode, signature, currentAddress)
          .then((resp) => {
            if (resp?.error) {
              toast.error(ToastComponent, { data: { type: "Error", content: "Referral process failed." } })
            }

            if (resp?.message === "Referral successfully processed") {
              toast.success(ToastComponent, { data: { type: "Success", content: resp?.message } })
              setHasBeenReferred(true)
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
    referralCode,
    setReferralCode,
    message,
    setMessage,
    signMessage,
    hasBeenReferred,
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
