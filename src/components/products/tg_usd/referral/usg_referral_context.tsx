"use client"

import { toast } from "react-toastify"
import { useUSGContext } from "../tg_usd_context"
import { ToastComponent } from "@/components/design_system/toast"
import { generateCode, getReferralStatus, validateReferralCode } from "../api"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { getCurrentBlock } from "@/services/service_rpc"

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

  signMessage: () => void

  generateReferralCode: () => void

  referralStatus: UserStatus
  setReferralStatus: (arg: UserStatus) => void

  code: string | undefined
}

export const UsgReferralCodeContext = createContext<UsgReferralCodeContextValues | undefined>(undefined)

export const UsgReferralCodeProvider = ({ children, code }: UsgReferralCodeContextProps) => {
  const { currentAddress, getWalletClient } = useWalletConnexionContext()

  const { refetchPoints } = useUSGContext()

  const [isLoading, setIsLoading] = useState<boolean>(false)

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
          setReferralStatus({ ...referralStatus, generatedCode: status?.referralCode, hasUsedCode: status?.hasUsedCode, friends: status?.friends })
        }
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
        const isoNowDate = new Date(Number(currentBlock.timestamp) * 1000).toISOString()
        const now = encodeURIComponent(isoNowDate)

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
