import { TgUsdMarketAsset } from "@/types"
import TgUsdRecordDepositPage from "@/components/products/tg_usd/record/deposit/tg_usd_record_deposit"
import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"

export default async function tgUsdMarketDetailDepositPage({ params }: { params: Promise<{ id: TgUsdMarketAsset }> }) {
  const collateral = (await params).id
  const { marketInfo, collateralInfo } = await loadMarketServerData(collateral)

  return <TgUsdRecordDepositPage collateralInfo={collateralInfo!} marketInfo={marketInfo!} />
}
