"use client"

import { FormState, FormAction } from "@/types"
import { Button } from "@/components/design_system/inputs/button"
import { useMemo } from "react"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@radix-ui/react-hover-card"
import Panel from "@/components/design_system/structure/panel"
import { IconWarningTriangle } from "@/components/icons/icon_warning_triangle"

type FormButtonsProps = {
  formState: FormState
  actions: FormAction
  labelApprove?: string
  labelProcess: string
}

export default function FormButtons({ formState, labelApprove = "Approve", labelProcess, actions }: FormButtonsProps) {
  const approveState = useMemo(() => {
    return !formState?.cantProcessReasons?.length ? (formState?.haveToApprove ? "active" : "inactive") : "disabled"
  }, [formState])

  const processState = useMemo(() => {
    return !formState?.cantProcessReasons?.length ? (formState?.haveToApprove ? "inactive" : "active") : "disabled"
  }, [formState])

  return (
    <>
      <div className="mt-[22px] flex w-full items-center justify-between gap-2">
        {actions.handleApprove ? (
          <>
            <Button label={labelApprove} onClick={actions.handleApprove} state={approveState} className="min-h-10 flex-1 justify-center" />
            <div>
              <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.5303 6.53033C10.8232 6.23744 10.8232 5.76256 10.5303 5.46967L5.75736 0.6967C5.46447 0.403806 4.98959 0.403806 4.6967 0.6967C4.40381 0.989593 4.40381 1.46447 4.6967 1.75736L8.93934 6L4.6967 10.2426C4.40381 10.5355 4.40381 11.0104 4.6967 11.3033C4.98959 11.5962 5.46447 11.5962 5.75736 11.3033L10.5303 6.53033ZM-5.52269e-08 6.75L10 6.75L10 5.25L5.52269e-08 5.25L-5.52269e-08 6.75Z"
                  fill="white"
                />
              </svg>
            </div>
          </>
        ) : (
          <div></div>
        )}
        <Button onClick={actions.handleProcess} state={processState} className="relative min-h-10 flex-1 justify-center">
          <div className="flex items-center gap-2">
            <span> {labelProcess} </span>
            {formState?.cantProcessReasons?.length > 0 && (
              <div className="absolute right-3 top-2 text-red-500">
                <HoverCard openDelay={300}>
                  <HoverCardTrigger className="w-full">
                    <IconWarningTriangle className="text-red-500" />
                    <HoverCardContent align="end" sideOffset={2} sticky="partial">
                      <Panel className="w-full border-red-500 bg-opacity-20">
                        <ul className="list-disc px-2 text-xs text-red-500">{formState?.cantProcessReasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                      </Panel>
                    </HoverCardContent>
                  </HoverCardTrigger>
                </HoverCard>
              </div>
            )}
          </div>
        </Button>
      </div>
    </>
  )
}
