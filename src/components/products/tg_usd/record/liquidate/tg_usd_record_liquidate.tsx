"use client"

import React from "react"
import TgUsdRecordLayout from "../tg_usd_record_layout"
import { AssetDataPriced, TgUsdMarketAsset } from "@/types"

import { TgUsdMarket } from "../../tg_usd_type"

import { TgUsdRecordProvider } from "../tg_usd_record_context"
import { TgUsdLiquidateProvider } from "./tg_usd_record_liquidate_context"
import TgUsdLiquidatePanel from "./tg_usd_record_liquidate_panel"

type TgUsdRecordLiquidateProps = {
  collateral: TgUsdMarketAsset
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
  tgUSDInfo: AssetDataPriced
}

export default function TgUsdRecordLiquidatePage({ collateral, collateralInfo, marketInfo, tgUSDInfo }: TgUsdRecordLiquidateProps) {
  return (
    <TgUsdRecordProvider collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo}>
      <TgUsdRecordLayout>
        <TgUsdLiquidateProvider>
          <TgUsdLiquidatePanel />
        </TgUsdLiquidateProvider>
      </TgUsdRecordLayout>
    </TgUsdRecordProvider>
  )
}
