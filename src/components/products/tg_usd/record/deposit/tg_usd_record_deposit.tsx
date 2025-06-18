import { TgUsdDepositProvider } from "./tg_usd_record_deposit_context"
import TgUsdDepositPanel from "./tg_usd_record_deposit_panel"

export default function TgUsdRecordDepositPage() {
  return (
    <TgUsdDepositProvider>
      <TgUsdDepositPanel />
    </TgUsdDepositProvider>
  )
}
