"use client"

import React from "react"
import TgUsdRecordLayout from "../tg_usd_record_layout"
import { TgUsdWithdrawProvider } from "./tg_usd_record_withdraw_context"
import TgUsdWithdrawPanel from "./tg_usd_record_withdraw_panel"

export default function TgUsdRecordWithdrawPage() {
  return (
    <TgUsdRecordLayout currentFeature="withdraw">
      <TgUsdWithdrawProvider>
        <TgUsdWithdrawPanel />
      </TgUsdWithdrawProvider>
    </TgUsdRecordLayout>
  )
}
