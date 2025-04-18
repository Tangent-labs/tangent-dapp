import { TgUsdLiquidateProvider } from "./tg_usd_record_liquidate_context"
import TgUsdLiquidatePanel from "./tg_usd_record_liquidate_panel"

export default function TgUsdRecordLiquidatePage() {
  return (
    <TgUsdLiquidateProvider>
      <TgUsdLiquidatePanel />
    </TgUsdLiquidateProvider>
  )
}
