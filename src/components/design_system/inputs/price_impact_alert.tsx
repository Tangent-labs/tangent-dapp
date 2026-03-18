"use client"

import { cn } from "@/lib/utils"
import { WarningButton } from "./warning_button"
import { IconWarningTriangle } from "@/components/icons"

type PriceImpactAlertProps = {
  dollarLoss: string
  priceImpact: number
  isLoading: boolean
  onClickContinue: () => void
}

const computeTitle = (priceImpact: number) => {
  if (priceImpact < 5) {
    return "High Price Impact"
  } else if (priceImpact >= 5 && priceImpact <= 10) {
    return "Excessive Price Impact"
  }
  return "Transaction Blocked"
}

const computeContent = (priceImpact: number, dollarLoss: string) => {
  if (priceImpact < 5) {
    return `This trade has a ${priceImpact}% price impact. You'll receive (${dollarLoss}) less than market value due to low pool liquidity.`
  } else if (priceImpact >= 5 && priceImpact <= 10) {
    return `This trade has a ${priceImpact}% price impact — you'll lose (${dollarLoss}). Consider reducing your amount or splitting into smaller trades.`
  }
  return `This trade has a ${priceImpact}% price impact, resulting in a (${dollarLoss}) loss. As a protocol safety measure, trades exceeding 10% price impact are blocked. Reduce your trade size or use a route with deeper liquidity.`
}

export const PriceImpactAlert = ({ dollarLoss, priceImpact, onClickContinue, isLoading }: PriceImpactAlertProps) => {
  const isWarning = priceImpact >= 1 && priceImpact < 5

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

        {computeTitle(priceImpact)}
      </span>

      <span className="my-1 text-xs text-subtitle">This swap has a price impact of {priceImpact}%.</span>
      <span className="mb-1 text-xs text-subtitle">{computeContent(priceImpact, dollarLoss)}</span>

      {priceImpact <= 10 && (
        <WarningButton state={"active"} warningType={isWarning ? "warning" : "danger"} disabled={isLoading} onClick={onClickContinue}>
          {isWarning ? "Confirm anyway" : "I understand the risk"}
        </WarningButton>
      )}
    </div>
  )
}
