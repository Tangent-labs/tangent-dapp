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
    isWarning={true}
    percentage={5}
    title="Wallet USG Usage"
    subtitle={`This repayment will use ${walletRepay} USG from your wallet.`}
    content=""
    {...rest}
  />
)
