import TgUsdRecordLayout from "../tg_usd_record_layout"
import { TgUsdLiquidateProvider } from "./tg_usd_record_liquidate_context"
import TgUsdLiquidatePanel from "./tg_usd_record_liquidate_panel"

export default function TgUsdRecordLiquidatePage() {
  return (
    <TgUsdRecordLayout currentFeature="liquidate">
      <TgUsdLiquidateProvider>
        <TgUsdLiquidatePanel />
      </TgUsdLiquidateProvider>
    </TgUsdRecordLayout>
  )
}
