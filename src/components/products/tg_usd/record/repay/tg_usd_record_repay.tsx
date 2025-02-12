"use client"

import React from "react"
import TgUsdRecordLayout from "../tg_usd_record_layout"
import { AssetDataPriced, TgUsdMarketAsset } from "@/types"

import { TgUsdMarket } from "../../tg_usd_type"

import { TgUsdRecordProvider } from "../tg_usd_record_context"
import { TgUsdRepayProvider } from "./tg_usd_record_repay_context"
import TgUsdRepayPanel from "./tg_usd_record_repay_panel"

type TgUsdRecordRepayPageProps = {
  collateral: TgUsdMarketAsset
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
  tgUSDInfo: AssetDataPriced
}

export default function TgUsdRecordRepayPage({ collateral, collateralInfo, marketInfo, tgUSDInfo }: TgUsdRecordRepayPageProps) {
  return (
    <TgUsdRecordProvider collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo}>
      <TgUsdRecordLayout currentFeature="repay">
        <TgUsdRepayProvider>
          <TgUsdRepayPanel />
        </TgUsdRepayProvider>
      </TgUsdRecordLayout>
    </TgUsdRecordProvider>
  )
}
