import { TgUsdMarketAsset } from "@/types"
import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"
import TgUsdRecordLeveragePage from "@/components/products/tg_usd/record/leverage/tg_usd_record_leverage"
import NotFound from "@/app/(products)/not-found"

export default async function tgUsdMarketLeveragePage({ params }: { params: Promise<{ id: TgUsdMarketAsset }> }) {
  const collateral = (await params).id
  const { marketInfo, tgUSDInfo, collateralInfo } = await loadMarketServerData(collateral)

  if (!marketInfo || !tgUSDInfo || !collateralInfo) return NotFound()

  return <TgUsdRecordLeveragePage collateralInfo={collateralInfo} marketInfo={marketInfo} />
}
