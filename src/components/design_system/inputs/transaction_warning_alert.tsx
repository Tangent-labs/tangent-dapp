"use client"

import { cn } from "@/lib/utils"
import { UI_V2 } from "@/v2/ui"
import { WarningButton } from "./warning_button"
import { IconWarningTriangle } from "@/components/icons"

type TransactionWarningAlertProps = {
  percentage?: number
  isLoading: boolean
  onClickContinue: () => void
  title: string
  subtitle: string
  content?: string
  displayConfirmationButton: boolean
  confirmationButtonLabel?: string
  className?: string
  showButtonState?: boolean
  isWarning?: boolean
}

export const TransactionWarningAlert = ({
  percentage,
  isLoading,
  onClickContinue,
  title,
  subtitle,
  content,
  showButtonState = false,
  displayConfirmationButton,
  confirmationButtonLabel,
  className,
  isWarning = false,
}: TransactionWarningAlertProps) => {
  if (UI_V2)
    return (
      <div
        className={cn(
          "flex w-full items-start gap-2.5 rounded-[10px] border border-hairline bg-white/[0.04] px-3 py-2.5 text-[13px]",
          isLoading && "shimmer",
          className
        )}
      >
        <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", isWarning ? "bg-warning" : "bg-negative")} />
        <span className="flex flex-col gap-0.5">
          <span className="font-medium text-white">{title}</span>
          {!!subtitle && <span className="text-ink-2">{subtitle}</span>}
          {!!content && <span className="text-ink-2">{content}</span>}
          {!!percentage && percentage <= 10 && displayConfirmationButton && (
            <span className="mt-2">
              <WarningButton
                {...(showButtonState ? { state: "active" as const } : {})}
                warningType={isWarning ? "warning" : "danger"}
                disabled={isLoading}
                onClick={onClickContinue}
              >
                {confirmationButtonLabel ?? (isWarning ? "Confirm anyway" : "I understand the risk")}
              </WarningButton>
            </span>
          )}
        </span>
      </div>
    )

  return (
    <div
      className={cn(
        "flex w-full flex-col items-start justify-start rounded-[10px] p-3",
        isLoading && "shimmer",
        isWarning ? "bg-[#FFE10008]" : "bg-[#FF030008]",
        className
      )}
    >
      <span className={cn("flex items-center justify-start gap-1 text-xs font-semibold", isWarning ? "text-slippage-warning" : "text-danger")}>
        <IconWarningTriangle className={cn(isWarning ? "fill-slippage-warning" : "fill-danger", "flex w-3 items-center justify-center")} />
        {title}
      </span>

      <span className="my-1 text-xs text-subtitle">{subtitle}</span>

      {!!content && <span className="mb-1 text-xs text-subtitle">{content}</span>}

      {!!percentage && percentage <= 10 && displayConfirmationButton && (
        <WarningButton
          {...(showButtonState ? { state: "active" as const } : {})}
          warningType={isWarning ? "warning" : "danger"}
          disabled={isLoading}
          onClick={onClickContinue}
        >
          {confirmationButtonLabel ?? (isWarning ? "Confirm anyway" : "I understand the risk")}
        </WarningButton>
      )}
    </div>
  )
}
