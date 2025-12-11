import USGRecordBorrowContent from "@/components/products/usg/record/borrow/usg_record_borrow_content"
import { USGBorrowProvider } from "@/components/products/usg/record/borrow/usg_record_borrow_context"

export default function USGRecordBorrowPage() {
  return (
    <USGBorrowProvider>
      <USGRecordBorrowContent />
    </USGBorrowProvider>
  )
}
