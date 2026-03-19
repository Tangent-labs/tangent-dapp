"use client"

import { useMemo } from "react"
import { FormState, FormAction } from "@/types"
import { Button } from "@/components/design_system/inputs/button"

type FormButtonsProps = {
  formState: FormState
  actions: FormAction
  labelApprove?: string
  labelProcess: string
  connect: () => void
  isLoading?: boolean
}

export default function FormButtons({ formState, labelApprove = "Approve", labelProcess, actions, connect, isLoading = false }: FormButtonsProps) {
  const isWalletConnected = !formState.cantProcessReasons.includes("No connected wallet.")
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
      {isWalletConnected ? (
        <Button
          hasLoadingState={true}
          isLoading={isLoading}
          label={label}
          onClick={isLoading ? () => {} : funcCalledOnClick}
          state={buttonState}
          className="w-full justify-center"
        />
      ) : (
        <Button label="Connect wallet" className="flex w-full items-center justify-center" onClick={connect} />
      )}
    </div>
  )
}
