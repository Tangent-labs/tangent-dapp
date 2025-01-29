import TgUsdRecordDepositPage from "@/components/products/tg_usd/record/deposit/tg_usd_record_deposit"
import { TgUsdMarketAsset } from "@/types"
import React from "react"
import NotFound from "../../not-found"
import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"

export default async function tgUsdMarketDetailDepositPage({ params }: { params: Promise<{ id: TgUsdMarketAsset }> }) {
  const collateral = (await params).id
  const { marketInfo, tgUSDInfo, collateralInfo } = await loadMarketServerData(collateral)
  if (!marketInfo || !tgUSDInfo || !collateralInfo) return NotFound()

  return <TgUsdRecordDepositPage collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo!} />
}
