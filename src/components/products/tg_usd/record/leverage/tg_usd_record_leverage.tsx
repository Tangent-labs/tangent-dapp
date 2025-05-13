import { AssetDataPriced } from "@/types"

import { TgUsdMarket } from "../../tg_usd_type"
import TgUsdLeveragePanel from "./tg_usd_record_leverage_panel"
import { TgUsdLeverageProvider } from "./tg_usd_record_leverage_context"

type TgUsdRecordLeverageProps = {
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
}

export default function TgUsdRecordLeveragePage({ collateralInfo, marketInfo }: TgUsdRecordLeverageProps) {
  return (
    <TgUsdLeverageProvider collateralInfo={collateralInfo} marketInfo={marketInfo}>
      <TgUsdLeveragePanel />
    </TgUsdLeverageProvider>
  )
}
