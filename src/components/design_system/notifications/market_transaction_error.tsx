type MarketTransactionErrorProps = {
  display: boolean
  error: string
}

export const MarketTransactionError = ({ display, error }: MarketTransactionErrorProps) => {
  if (display) return <div className="flex w-full items-center justify-center text-xs text-red-500">{error}</div>

  return <></>
}
