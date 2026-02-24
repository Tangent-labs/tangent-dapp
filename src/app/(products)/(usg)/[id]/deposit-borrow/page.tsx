import { USGDepositProvider } from "@/components/products/usg/record/deposit/usg_record_deposit_context"
import USGDepositContent from "@/components/products/usg/record/deposit/usg_record_deposit_content"

export default function USGRecordDepositAndBorrowPage() {
  return (
    <USGDepositProvider isDepositAndBorrowInput={true}>
      <USGDepositContent />
    </USGDepositProvider>
  )
}
