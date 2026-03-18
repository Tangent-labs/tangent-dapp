"use client"

import { cn } from "@/lib/utils"
import { IconWarningTriangle } from "@/components/icons"
import { WarningButton } from "./warning_button"

type SlippageAlertProps = {
  symbol: string
  tokenLoss: string
  dollarLoss: string
  slippage: number
  isLoading: boolean
  onClickContinue: () => void
}

const computeTitle = (slippage: number) => {
  if (slippage < 5) {
    return "High Slippage Warning"
  } else if (slippage >= 5 && slippage <= 10) {
    return "Excessive Slippage Alert"
  }
  return "Slippage Guard"
}

const computeContent = (slippage: number, tokenLoss: string, symbol: string, dollarLoss: string) => {
  if (slippage < 5) {
    return `You could lose up to ${tokenLoss} ${symbol} (~${dollarLoss}) on this swap. A high slippage tolerance exposes your transaction to MEV sandwich attacks, where bots manipulate the price around your trade to extract value.`
  } else if (slippage >= 5 && slippage <= 10) {
    return `You could lose up to ${tokenLoss} ${symbol} (~${dollarLoss}) on this swap. At ${slippage}% slippage, your transaction is a prime target for MEV bots that will front-run your trade and pocket the difference.`
  }
  return `At ${slippage}% slippage, you risk losing ${tokenLoss} ${symbol} (~${dollarLoss}). To protect our users from MEV sandwich attacks, this dApp enforces a maximum slippage tolerance of 10% as a built-in safety guard. Please lower your slippage to proceed.`
}

export const SlippageAlert = ({ symbol, tokenLoss, dollarLoss, slippage, onClickContinue, isLoading }: SlippageAlertProps) => {
  const isWarning = slippage >= 1 && slippage < 5

  return (
    <div
      className={cn(
        "mt-2 flex w-full flex-col items-start justify-start rounded-[10px] p-3",
        isLoading ? "shimmer" : "",
        isWarning ? "bg-[#FFE10008]" : "bg-[#FF030008]"
      )}
    >
      <span className={cn("flex items-center justify-start gap-1 text-xs font-semibold", isWarning ? "text-slippage-warning" : "text-danger")}>
        <IconWarningTriangle className={cn(isWarning ? "fill-slippage-warning" : "fill-danger", "flex w-3 items-center justify-center")}></IconWarningTriangle>

        {computeTitle(slippage)}
      </span>

      <span className="my-1 text-xs text-subtitle">This swap has a slippage of {slippage}%.</span>
      <span className="mb-1 text-xs text-subtitle">{computeContent(slippage, tokenLoss, symbol, dollarLoss)}</span>

      {slippage <= 10 && (
        <WarningButton warningType={isWarning ? "warning" : "danger"} disabled={isLoading} onClick={onClickContinue}>
          {isWarning ? "Confirm anyway" : "I understand the risk"}
        </WarningButton>
      )}
    </div>
  )
}
