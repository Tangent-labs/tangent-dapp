import USGRecordBorrowContent from "@/components/products/tg_usd/record/borrow/usg_record_borrow_content"
import { USGBorrowProvider } from "@/components/products/tg_usd/record/borrow/usg_record_borrow_context"

export default function USGRecordBorrowPage() {
  return (
    <USGBorrowProvider>
      <USGRecordBorrowContent />
    </USGBorrowProvider>
  )
}
