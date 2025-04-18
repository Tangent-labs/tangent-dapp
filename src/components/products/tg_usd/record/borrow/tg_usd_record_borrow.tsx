"use client"

import { TgUsdBorrowProvider } from "./tg_usd_record_borrow_context"
import TgUsdBorrowPanel from "./tg_usd_record_borrow_panel"

export default function TgUsdRecordBorrowPage() {
  return (
    <TgUsdBorrowProvider>
      <TgUsdBorrowPanel />
    </TgUsdBorrowProvider>
  )
}
