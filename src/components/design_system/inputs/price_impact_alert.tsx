import { useMemo } from "react"
import { TransactionWarningAlert } from "./transaction_warning_alert"

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

const contents = (swapPriceImpact: number, swapDollarLoss: string, mintDumpPriceImpact?: number, mintDumpDollarLoss?: string): string => {
  let alert: string

  if (swapPriceImpact < 0.25) {
    alert = ""
  } else if (swapPriceImpact < 5) {
    alert = `Due to limited pool liquidity, this trade carries a ${swapPriceImpact?.toFixed(2)}% price impact. You may receive up to ${swapDollarLoss} less than the current market value.`
  } else if (swapPriceImpact <= 10) {
    alert = `This trade has a ${swapPriceImpact?.toFixed(2)}% price impact, which may result in a ${swapDollarLoss} shortfall.`
  } else {
    alert = `A ${swapPriceImpact?.toFixed(2)}% price impact would result in an estimated ${swapDollarLoss} loss. As a safety measure, trades exceeding 10% impact are not permitted.`
  }

  if (mintDumpPriceImpact && mintDumpPriceImpact > 0) {
    alert += `\nThe borrow and sell operation adds an estimated ${mintDumpPriceImpact.toFixed(2)}% price impact, with a potential additional loss of up to ${mintDumpDollarLoss}.`
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
    <TransactionWarningAlert
      displayConfirmationButton={displayConfirmationButton}
      percentage={effectivePriceImpact}
      title={titles(effectivePriceImpact)}
      subtitle={`This operation has a price impact of ${effectivePriceImpact.toFixed(2)}%.`}
      content={contents(priceImpact, dollarLoss, mintDumpPriceImpact, mintDumpDollarLoss)}
      showButtonState
      className={`${className} whitespace-pre-line`}
      isWarning={effectivePriceImpact >= 0.25 && effectivePriceImpact < 5}
      {...rest}
    />
  )
}
