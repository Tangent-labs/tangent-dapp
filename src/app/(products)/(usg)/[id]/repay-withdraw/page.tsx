import USGRepayContent from "@/components/products/usg/record/repay/usg_record_repay_content"
import { USGRepayProvider } from "@/components/products/usg/record/repay/usg_record_repay_context"

export default function USGRecordRepayPage() {
  return (
    <USGRepayProvider isRepayAndWithdrawInput={true}>
      <USGRepayContent />
    </USGRepayProvider>
  )
}
