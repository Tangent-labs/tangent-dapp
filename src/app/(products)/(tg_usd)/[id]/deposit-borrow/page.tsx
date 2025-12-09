import USGDepositContent from "@/components/products/tg_usd/record/deposit/usg_record_deposit_panel"
import { USGDepositProvider } from "@/components/products/tg_usd/record/deposit/usg_record_deposit_context"

export default function USGRecordDepositAndBorrowPage() {
  return (
    <USGDepositProvider isDepositAndBorrowInput={true}>
      <USGDepositContent />
    </USGDepositProvider>
  )
}
