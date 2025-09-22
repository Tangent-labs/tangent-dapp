import USGRepayContent from "@/components/products/tg_usd/record/repay/usg_record_repay_content"
import { USGRepayProvider } from "@/components/products/tg_usd/record/repay/usg_record_repay_context"

export default function TgUsdRecordRepayPage() {
  return (
    <USGRepayProvider>
      <USGRepayContent />
    </USGRepayProvider>
  )
}
