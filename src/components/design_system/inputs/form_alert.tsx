import { FormError } from "@/components/products/usg/usg_type"
import { TransactionWarningAlert } from "./transaction_warning_alert"

type FormAlertProps = {
  error: FormError
  isLoading: boolean
  className?: string
}

export const FormAlert = ({ error, isLoading, className }: FormAlertProps) => (
  <TransactionWarningAlert
    percentage={6}
    isLoading={isLoading}
    onClickContinue={() => {}}
    title={error.title}
    subtitle={error.subtitle}
    content={error.content}
    displayConfirmationButton={false}
    className={className}
  />
)
