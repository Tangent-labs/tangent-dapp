"use client"

import React from "react"
import TgUsdRecordLayout from "../tg_usd_record_layout"
import { AssetDataPriced, TgUsdMarketAsset } from "@/types"

import { TgUsdMarket, ZapToken } from "../../tg_usd_type"
import { TgUsdDepositProvider } from "./tg_usd_record_deposit_context"
import TgUsdDepositPanel from "./tg_usd_record_deposit_panel"
import { TgUsdRecordProvider } from "../tg_usd_record_context"

type TgUsdRecordDepositProps = {
  tokens: ZapToken[]
  collateral: TgUsdMarketAsset
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
  tgUSDInfo: AssetDataPriced
}

export default function TgUsdRecordDepositPage({ tokens, collateral, collateralInfo, marketInfo, tgUSDInfo }: TgUsdRecordDepositProps) {
  return (
    <TgUsdRecordProvider collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo}>
      <TgUsdRecordLayout currentFeature="deposit">
        <TgUsdDepositProvider tokens={tokens} collateralInfo={collateralInfo} marketInfo={marketInfo}>
          <TgUsdDepositPanel />
        </TgUsdDepositProvider>
      </TgUsdRecordLayout>
    </TgUsdRecordProvider>
  )
}
