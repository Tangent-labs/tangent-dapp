"use client"

import { useMemo } from "react"
import { FormState, FormAction } from "@/types"
import { LoadingButton } from "../inputs/loading_button"
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
  const approveState = useMemo(() => {
    return !formState?.cantProcessReasons?.length ? (formState?.haveToApprove ? "active" : "inactive") : "disabled"
  }, [formState])

  const processState = useMemo(() => {
    return !formState?.cantProcessReasons?.length ? (formState?.haveToApprove ? "inactive" : "active") : "disabled"
  }, [formState])

  return (
    <div className="flex w-full items-center justify-between gap-2">
      {formState.cantProcessReasons.includes("No connected wallet.") ? (
        <Button label="Connect wallet" className="flex w-full items-center justify-center" onClick={connect} />
      ) : (
        <>
          {!!actions.handleApprove && formState?.haveToApprove ? (
            <LoadingButton isLoading={isLoading} label={labelApprove} onClick={actions.handleApprove} state={approveState} className="w-full justify-center" />
          ) : (
            <LoadingButton isLoading={isLoading} label={labelProcess} onClick={actions.handleProcess} state={processState} className="w-full justify-center" />
          )}
        </>
      )}
    </div>
  )
}
