import { TransactionWarningAlert } from "../inputs/transaction_warning_alert"

type MaxBorrowCapReachedProps = {
  display: boolean
}

export const MaxBorrowCapReached = ({ display }: MaxBorrowCapReachedProps) => {
  if (display)
    return (
      <TransactionWarningAlert
        displayConfirmationButton={false}
        isWarning={false}
        title="Max borrow cap reached"
        subtitle=""
        content="You cannot borrow USG for now."
        showButtonState
        className="my-1 whitespace-pre-line"
        isLoading={false}
        onClickContinue={() => {}}
      />
    )

  return <></>
}
