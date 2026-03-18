import { SwapWarningAlert } from "./swap_warning_alert"

type SlippageAlertProps = {
  symbol: string
  tokenLoss: string
  dollarLoss: string
  slippage: number
  isLoading: boolean
  onClickContinue: () => void
}

const titles = (s: number) => (s < 5 ? "High Slippage Warning" : s <= 10 ? "Excessive Slippage Alert" : "Slippage Guard")

const contents = (s: number, tokenLoss: string, symbol: string, dollarLoss: string) => {
  if (s < 5)
    return `You could lose up to ${tokenLoss} ${symbol} (~${dollarLoss}) on this swap. A high slippage tolerance exposes your transaction to MEV sandwich attacks, where bots manipulate the price around your trade to extract value.`
  if (s <= 10)
    return `You could lose up to ${tokenLoss} ${symbol} (~${dollarLoss}) on this swap. At ${s}% slippage, your transaction is a prime target for MEV bots that will front-run your trade and pocket the difference.`
  return `At ${s}% slippage, you risk losing ${tokenLoss} ${symbol} (~${dollarLoss}). To protect our users from MEV sandwich attacks, this dApp enforces a maximum slippage tolerance of 10% as a built-in safety guard. Please lower your slippage to proceed.`
}

export const SlippageAlert = ({ symbol, tokenLoss, dollarLoss, slippage, ...rest }: SlippageAlertProps) => (
  <SwapWarningAlert
    percentage={slippage}
    title={titles(slippage)}
    subtitle={`This swap has a slippage of ${slippage}%.`}
    content={contents(slippage, tokenLoss, symbol, dollarLoss)}
    {...rest}
  />
)
