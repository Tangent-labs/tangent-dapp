import { USGDepositProvider } from "@/components/products/usg/record/deposit/usg_record_deposit_context"
import USGDepositContent from "@/components/products/usg/record/deposit/usg_record_deposit_panel"

export default function USGRecordDepositPage() {
  return (
    <USGDepositProvider>
      <USGDepositContent />
    </USGDepositProvider>
  )
}
