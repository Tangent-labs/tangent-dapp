import TgUsdLeveragePanel from "./tg_usd_record_leverage_panel"
import { TgUsdLeverageProvider } from "./tg_usd_record_leverage_context"

export default function TgUsdRecordLeveragePage() {
  return (
    <TgUsdLeverageProvider>
      <TgUsdLeveragePanel />
    </TgUsdLeverageProvider>
  )
}
