import { SwapWarningAlert } from "./swap_warning_alert"

type PriceImpactAlertProps = {
  dollarLoss: string
  priceImpact: number
  isLoading: boolean
  onClickContinue: () => void
}

const titles = (p: number) => (p < 5 ? "High Price Impact" : p <= 10 ? "Excessive Price Impact" : "Transaction Blocked")

const contents = (p: number, loss: string) => {
  if (p < 5) return `This trade has a ${p}% price impact. You'll receive (${loss}) less than market value due to low pool liquidity.`
  if (p <= 10) return `This trade has a ${p}% price impact — you'll lose (${loss}). Consider reducing your amount or splitting into smaller trades.`
  return `This trade has a ${p}% price impact, resulting in a (${loss}) loss. As a protocol safety measure, trades exceeding 10% price impact are blocked. Reduce your trade size or use a route with deeper liquidity.`
}

export const PriceImpactAlert = ({ dollarLoss, priceImpact, ...rest }: PriceImpactAlertProps) => (
  <SwapWarningAlert
    percentage={priceImpact}
    title={titles(priceImpact)}
    subtitle={`This swap has a price impact of ${priceImpact}%.`}
    content={contents(priceImpact, dollarLoss)}
    showButtonState
    {...rest}
  />
)
