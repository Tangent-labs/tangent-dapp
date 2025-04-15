import { AssetDataPriced } from "@/types"

import { TgUsdMarket, ZapToken } from "../../tg_usd_type"
import { TgUsdDepositProvider } from "./tg_usd_record_deposit_context"
import TgUsdDepositPanel from "./tg_usd_record_deposit_panel"

type TgUsdRecordDepositProps = {
  tokens: ZapToken[]
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
}

export default function TgUsdRecordDepositPage({ tokens, collateralInfo, marketInfo }: TgUsdRecordDepositProps) {
  return (
    <TgUsdDepositProvider tokens={tokens} collateralInfo={collateralInfo} marketInfo={marketInfo}>
      <TgUsdDepositPanel />
    </TgUsdDepositProvider>
  )
}
