import { TransactionWarningAlert } from "./transaction_warning_alert"

type WalletRepayAlertProps = {
  walletRepay: string
  isLoading: boolean
  displayConfirmationButton: boolean
  confirmationButtonLabel: string
  onClickContinue: () => void
  className?: string
}

export const WalletRepayAlert = ({ walletRepay, ...rest }: WalletRepayAlertProps) => (
  <TransactionWarningAlert
    percentage={4}
    title="Wallet USG Usage"
    subtitle={`This repayment will use your wallet USG (${walletRepay}). `}
    content=""
    {...rest}
  />
)
