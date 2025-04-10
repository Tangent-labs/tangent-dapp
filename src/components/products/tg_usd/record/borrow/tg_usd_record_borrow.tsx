"use client"

import React from "react"
import TgUsdRecordLayout from "../tg_usd_record_layout"
import { TgUsdBorrowProvider } from "./tg_usd_record_borrow_context"
import TgUsdBorrowPanel from "./tg_usd_record_borrow_panel"

export default function TgUsdRecordBorrowPage() {
  return (
    <TgUsdRecordLayout currentFeature="borrow">
      <TgUsdBorrowProvider>
        <TgUsdBorrowPanel />
      </TgUsdBorrowProvider>
    </TgUsdRecordLayout>
  )
}
