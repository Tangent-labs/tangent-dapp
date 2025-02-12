import NotFound from "@/app/(products)/not-found"
import TgUsdRecordLiquidatePage from "@/components/products/tg_usd/record/liquidate/tg_usd_record_liquidate"
import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"

import { TgUsdMarketAsset } from "@/types"

export default async function TgUsdMarketLiquidatePage({ params }: { params: Promise<{ id: TgUsdMarketAsset }> }) {
  const collateral = (await params).id
  const { marketInfo, tgUSDInfo, collateralInfo } = await loadMarketServerData(collateral)
  if (!marketInfo || !tgUSDInfo || !collateralInfo) return NotFound()

  return <TgUsdRecordLiquidatePage collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo!} />
}
