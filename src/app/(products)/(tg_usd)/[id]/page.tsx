import TgUsdRecordDepositPage from "@/components/products/tg_usd/record/deposit/tg_usd_record_deposit"
import { tgUsdMarkets } from "@/components/products/tg_usd/tg_usd_repository"
import { getAssetInfo } from "@/services/service_existing_asset"
import { TgUsdMarketAsset } from "@/types"
import React from "react"
import NotFound from "../../not-found"

export default async function tgUsdMarketDetailDepositPage({ params }: { params: Promise<{ id: TgUsdMarketAsset }> }) {
  const collateral = (await params).id
  const collateralInfo = await getAssetInfo([collateral])
  const marketInfo = tgUsdMarkets.find((market) => market.marketName === collateral)
  const tgUSDInfo = (await getAssetInfo(["tgUSD"]))?.at(0)

  if (!marketInfo || !collateralInfo?.length) return NotFound()

  return <TgUsdRecordDepositPage collateral={collateral} collateralInfo={collateralInfo.at(0)!} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo!} />
}
