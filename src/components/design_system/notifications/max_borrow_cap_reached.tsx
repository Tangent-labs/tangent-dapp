type MaxBorrowCapReachedProps = {
  display: boolean
}

export const MaxBorrowCapReached = ({ display }: MaxBorrowCapReachedProps) => {
  if (display) return <div className="flex w-full items-center justify-center text-xs text-red-500">Max borrow cap reached. You cannot borrow USG for now</div>

  return <></>
}
