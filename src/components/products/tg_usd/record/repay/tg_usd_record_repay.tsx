import TgUsdRecordLayout from "../tg_usd_record_layout"
import { TgUsdRepayProvider } from "./tg_usd_record_repay_context"
import TgUsdRepayPanel from "./tg_usd_record_repay_panel"

export default function TgUsdRecordRepayPage() {
  return (
    <TgUsdRecordLayout currentFeature="repay">
      <TgUsdRepayProvider>
        <TgUsdRepayPanel />
      </TgUsdRepayProvider>
    </TgUsdRecordLayout>
  )
}
