import { useMemo } from "react"
import { SwapWarningAlert } from "./swap_warning_alert"

type PriceImpactAlertProps = {
  dollarLoss: string
  priceImpact: number
  mintDumpPriceImpact?: number
  mintDumpDollarLoss?: string
  isLoading: boolean
  displayConfirmationButton: boolean
  onClickContinue: () => void
  className?: string
}

const titles = (p: number) => (p < 5 ? "High Price Impact" : p <= 10 ? "Excessive Price Impact" : "Transaction Blocked")

const contents = (swapPriceImpact: number, swapDollarLoss: string, mintDumpPriceImpact?: number, mintDumpDollarLoss?: string) => {
  let alert: string

  if (swapPriceImpact < 1) {
    alert = ""
  } else if (swapPriceImpact < 5) {
    alert = `This trade has a ${swapPriceImpact}% price impact. You'll receive (${swapDollarLoss}) less than market value due to low pool liquidity.`
  } else if (swapPriceImpact <= 10) {
    alert = `This trade has a ${swapPriceImpact}% price impact — you'll lose (${swapDollarLoss}). Consider reducing your amount or splitting into smaller trades.`
  } else {
    alert = `This trade has a ${swapPriceImpact}% price impact, resulting in a (${swapDollarLoss}) loss. As a protocol safety measure, trades exceeding 10% price impact are blocked. Reduce your trade size or use a route with deeper liquidity.`
  }

  if (mintDumpPriceImpact && mintDumpPriceImpact > 0) {
    alert += `\nThe borrow and sell USG operation involves an additional ${mintDumpPriceImpact.toFixed(2)}% price impact. You could lose up to (${mintDumpDollarLoss}) `
  }

  return alert
}

export const PriceImpactAlert = ({
  dollarLoss,
  priceImpact,
  mintDumpPriceImpact,
  mintDumpDollarLoss,
  className,
  displayConfirmationButton,
  ...rest
}: PriceImpactAlertProps) => {
  const effectivePriceImpact = useMemo(() => {
    return Math.max(priceImpact, mintDumpPriceImpact ?? 0)
  }, [priceImpact, mintDumpPriceImpact])

  return (
    <SwapWarningAlert
      displayConfirmationButton={displayConfirmationButton}
      percentage={effectivePriceImpact}
      title={titles(effectivePriceImpact)}
      subtitle={`This operation has a price impact of ${effectivePriceImpact.toFixed(2)}%.`}
      content={contents(priceImpact, dollarLoss, mintDumpPriceImpact, mintDumpDollarLoss)}
      showButtonState
      className={`${className} whitespace-pre-line`}
      {...rest}
    />
  )
}
