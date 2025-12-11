"use client"

import USGWithdrawContent from "@/components/products/usg/record/withdraw/usg_record_withdraw_content"
import { USGWithdrawProvider } from "@/components/products/usg/record/withdraw/usg_record_withdraw_context"

export default function USGRecordWithdrawPage() {
  return (
    <USGWithdrawProvider>
      <USGWithdrawContent />
    </USGWithdrawProvider>
  )
}
