import NotFound from "@/app/(products)/not-found"
import TgUsdRecordWithdrawPage from "@/components/products/tg_usd/record/withdraw/tg_usd_record_withdraw"
import { tgUsdMarkets } from "@/components/products/tg_usd/tg_usd_repository"
import { getAssetInfo } from "@/services/service_existing_asset"
import { TgUsdMarketAsset } from "@/types"
import React from "react"

export default async function TgUsdMarketWithdrawPage({ params }: { params: Promise<{ id: TgUsdMarketAsset }> }) {
  // Fetch data here if needed
  const collateral = (await params).id
  const tokenInfos = await getAssetInfo([collateral, "tgUSD"])
  const marketInfo = tgUsdMarkets.find((market) => market.marketName === collateral)
  if (!marketInfo || tokenInfos?.length !== 2) return NotFound()

  return <TgUsdRecordWithdrawPage collateral={collateral} collateralInfo={tokenInfos.at(0)!} marketInfo={marketInfo} tgUSDInfo={tokenInfos.at(1)!} />
}
