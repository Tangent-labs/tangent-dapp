import NotFound from "@/app/(products)/not-found"
import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"
import TgUsdRecordWithdrawPage from "@/components/products/tg_usd/record/withdraw/tg_usd_record_withdraw"
import { TgUsdMarketAsset } from "@/types"
import React from "react"

export default async function TgUsdMarketWithdrawPage({ params }: { params: Promise<{ id: TgUsdMarketAsset }> }) {
  // Fetch data here if needed
  const collateral = (await params).id
  const { marketInfo, tgUSDInfo, collateralInfo } = await loadMarketServerData(collateral)
  if (!marketInfo || !tgUSDInfo || !collateralInfo) return NotFound()

  return <TgUsdRecordWithdrawPage collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo} />
}
