"use client"

import { FormState, FormAction } from "@/types"
import { Button } from "@/components/design_system/inputs/button"
import { useMemo } from "react"

type FormButtonsProps = {
  formState: FormState
  actions: FormAction
  labelApprove?: string
  labelProcess: string
  connect: () => void
}

export function FormButtons({ formState, labelApprove = "Approve", labelProcess, actions, connect }: FormButtonsProps) {
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
          {actions.handleApprove ? (
            <>
              <Button label={labelApprove} onClick={actions.handleApprove} state={approveState} className="w-full justify-center" />
              <svg className="w-5" width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.5303 6.53033C10.8232 6.23744 10.8232 5.76256 10.5303 5.46967L5.75736 0.6967C5.46447 0.403806 4.98959 0.403806 4.6967 0.6967C4.40381 0.989593 4.40381 1.46447 4.6967 1.75736L8.93934 6L4.6967 10.2426C4.40381 10.5355 4.40381 11.0104 4.6967 11.3033C4.98959 11.5962 5.46447 11.5962 5.75736 11.3033L10.5303 6.53033ZM-5.52269e-08 6.75L10 6.75L10 5.25L5.52269e-08 5.25L-5.52269e-08 6.75Z"
                  fill="white"
                />
              </svg>
              <Button label={labelProcess} onClick={actions.handleProcess} state={processState} className="w-full justify-center" />
            </>
          ) : (
            <Button label={labelProcess} onClick={actions.handleProcess} state={processState} className="w-full justify-center" />
          )}
        </>
      )}
    </div>
  )
}
