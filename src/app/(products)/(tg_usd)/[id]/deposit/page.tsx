import USGDepositContent from "@/components/products/tg_usd/record/deposit/usg_record_deposit_panel"
import { USGDepositProvider } from "@/components/products/tg_usd/record/deposit/usg_record_deposit_context"

export default function USGRecordDepositPage() {
  return (
    <USGDepositProvider isDepositAndBorrowInput={false}>
      <USGDepositContent />
    </USGDepositProvider>
  )
}
