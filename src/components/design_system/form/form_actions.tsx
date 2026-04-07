"use client"

import { useMemo } from "react"
import { FormAction } from "@/types"
import { Button } from "@/components/design_system/inputs/button"
import { FormState } from "@/components/products/usg/usg_type"

type FormButtonsProps = {
  formState: FormState
  actions: FormAction
  labelApprove?: string
  labelProcess: string
  connect: () => void
  isLoading?: boolean
  disabled?: boolean
}

export default function FormButtons({
  formState,
  labelApprove = "Approve",
  labelProcess,
  actions,
  connect,
  isLoading = false,
  disabled = false,
}: FormButtonsProps) {
  const isWalletConnected = useMemo(() => {
    if (!!formState.errors && formState.errors?.length >= 0) {
      return !formState.errors.some((e) => e?.key === "no-wallet")
    }

    return false
  }, [formState])

  const isApproveNeeded = !!actions.handleApprove && formState?.haveToApprove

  const label = isApproveNeeded ? labelApprove : labelProcess

  const funcCalledOnClick = isApproveNeeded ? actions.handleApprove : actions.handleProcess

  const buttonState = useMemo(() => {
    if (disabled || isLoading) return "disabled"

    if (!formState?.errors?.length && (formState.haveToApprove || formState.canProcess)) return "active"

    return "disabled"
  }, [formState, isLoading, disabled])

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
