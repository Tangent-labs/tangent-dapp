"use client"

import { TgUsdWithdrawProvider } from "./tg_usd_record_withdraw_context"
import TgUsdWithdrawPanel from "./tg_usd_record_withdraw_panel"

export default function TgUsdRecordWithdrawPage() {
  return (
    <TgUsdWithdrawProvider>
      <TgUsdWithdrawPanel />
    </TgUsdWithdrawProvider>
  )
}
