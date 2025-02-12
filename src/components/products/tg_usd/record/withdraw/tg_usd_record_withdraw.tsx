"use client"

import React from "react"
import TgUsdRecordLayout from "../tg_usd_record_layout"
import { AssetDataPriced, TgUsdMarketAsset } from "@/types"

import { TgUsdMarket } from "../../tg_usd_type"

import { TgUsdRecordProvider } from "../tg_usd_record_context"
import { TgUsdWithdrawProvider } from "./tg_usd_record_withdraw_context"
import TgUsdWithdrawPanel from "./tg_usd_record_withdraw_panel"

type TgUsdRecordWithdrawProps = {
  collateral: TgUsdMarketAsset
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
  tgUSDInfo: AssetDataPriced
}

export default function TgUsdRecordWithdrawPage({ collateral, collateralInfo, marketInfo, tgUSDInfo }: TgUsdRecordWithdrawProps) {
  return (
    <TgUsdRecordProvider collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo}>
      <TgUsdRecordLayout>
        <TgUsdWithdrawProvider>
          <TgUsdWithdrawPanel />
        </TgUsdWithdrawProvider>
      </TgUsdRecordLayout>
    </TgUsdRecordProvider>
  )
}
