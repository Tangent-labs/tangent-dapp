import { AssetDataPriced } from "@/types"

import { TgUsdMarket } from "../../tg_usd_type"
import { TgUsdDepositProvider } from "./tg_usd_record_deposit_context"
import TgUsdDepositPanel from "./tg_usd_record_deposit_panel"

type TgUsdRecordDepositProps = {
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
}

export default function TgUsdRecordDepositPage({ collateralInfo, marketInfo }: TgUsdRecordDepositProps) {
  return (
    <TgUsdDepositProvider collateralInfo={collateralInfo} marketInfo={marketInfo}>
      <TgUsdDepositPanel />
    </TgUsdDepositProvider>
  )
}
