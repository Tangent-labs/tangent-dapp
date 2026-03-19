"use client"

import { cn } from "@/lib/utils"
import { WarningButton } from "./warning_button"
import { IconWarningTriangle } from "@/components/icons"

type TradeWarningAlertProps = {
  percentage: number
  isLoading: boolean
  onClickContinue: () => void
  title: string
  subtitle: string
  content: string
  showButtonState?: boolean
}

export const SwapWarningAlert = ({ percentage, isLoading, onClickContinue, title, subtitle, content, showButtonState = false }: TradeWarningAlertProps) => {
  const isWarning = percentage >= 1 && percentage < 5

  return (
    <div
      className={cn(
        "my-2 flex w-full flex-col items-start justify-start rounded-[10px] p-3",
        isLoading && "shimmer",
        isWarning ? "bg-[#FFE10008]" : "bg-[#FF030008]"
      )}
    >
      <span className={cn("flex items-center justify-start gap-1 text-xs font-semibold", isWarning ? "text-slippage-warning" : "text-danger")}>
        <IconWarningTriangle className={cn(isWarning ? "fill-slippage-warning" : "fill-danger", "flex w-3 items-center justify-center")} />
        {title}
      </span>

      <span className="my-1 text-xs text-subtitle">{subtitle}</span>
      <span className="mb-1 text-xs text-subtitle">{content}</span>

      {percentage <= 10 && (
        <WarningButton
          {...(showButtonState ? { state: "active" as const } : {})}
          warningType={isWarning ? "warning" : "danger"}
          disabled={isLoading}
          onClick={onClickContinue}
        >
          {isWarning ? "Confirm anyway" : "I understand the risk"}
        </WarningButton>
      )}
    </div>
  )
}
