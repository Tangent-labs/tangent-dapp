"use client"

import { useMemo } from "react"
import { FormState, FormAction } from "@/types"
import { Button } from "@/components/design_system/inputs/button"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

type FormButtonsProps = {
  formState: FormState
  actions: FormAction
  labelApprove?: string
  labelProcess: string
  isLoading?: boolean
}

export default function FormButtons({ formState, labelApprove = "Approve", labelProcess, actions, isLoading = false }: FormButtonsProps) {
  const { canInteract, walletActionLabel, requestWalletAction } = useWalletConnexionContext()
  const isApproveNeeded = !!actions.handleApprove && formState?.haveToApprove
  let label = ""
  let funcCalledOnClick: (() => void) | undefined
  if (isApproveNeeded) {
    label = labelApprove
    funcCalledOnClick = actions.handleApprove
  } else {
    label = labelProcess
    funcCalledOnClick = actions.handleProcess
  }
  const buttonState = useMemo(() => {
    if (isLoading) {
      return "disabled"
    }
    if (formState.cantProcessReasons.length === 0 && (formState.haveToApprove || formState.canProcess)) {
      return "active"
    }
    return "disabled"
  }, [formState])

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <Button
        hasLoadingState={canInteract}
        isLoading={isLoading}
        label={canInteract ? label : walletActionLabel}
        onClick={canInteract ? (isLoading || buttonState !== "active" ? () => {} : funcCalledOnClick) : requestWalletAction}
        state={canInteract && buttonState === "active" ? "active" : canInteract ? "disabled" : "active"}
        className="w-full justify-center"
        classNameChild="flex w-full items-center justify-center"
      />
    </div>
  )
}
