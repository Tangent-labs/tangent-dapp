import { TgUsdRepayProvider } from "./tg_usd_record_repay_context"
import TgUsdRepayPanel from "./tg_usd_record_repay_panel"

export default function TgUsdRecordRepayPage() {
  return (
    <TgUsdRepayProvider>
      <TgUsdRepayPanel />
    </TgUsdRepayProvider>
  )
}
