import NotFound from "@/app/(products)/not-found"
import TgUsdRecordBorrowPage from "@/components/products/tg_usd/record/borrow/tg_usd_record_borrow"
import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"
import { TgUsdMarketAsset } from "@/types"
import React from "react"

export default async function TgUsdMarketBorrowPage({ params }: { params: Promise<{ id: TgUsdMarketAsset }> }) {
  const collateral = (await params).id
  const { marketInfo, tgUSDInfo, collateralInfo } = await loadMarketServerData(collateral)
  if (!marketInfo || !tgUSDInfo || !collateralInfo) return NotFound()

  return <TgUsdRecordBorrowPage collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo!} />
}
