import { USGDepositProvider } from "@/components/products/usg/record/deposit/usg_record_deposit_context"
import USGDepositContent from "@/components/products/usg/record/deposit/usg_record_deposit_content"

export default function USGRecordDepositPage() {
  return (
    <USGDepositProvider isDepositAndBorrowInput={false}>
      <USGDepositContent />
    </USGDepositProvider>
  )
}
