"use client"

import React from "react"
import TgUsdRecordLayout from "../tg_usd_record_layout"
import { AssetDataPriced, TgUsdMarketAsset } from "@/types"

import { TgUsdMarket } from "../../tg_usd_type"

type TgUsdRecordDepositProps = {
  collateral: TgUsdMarketAsset
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
}

export default function TgUsdRecordDepositPage({ collateral, collateralInfo, marketInfo }: TgUsdRecordDepositProps) {
  return (
    <TgUsdRecordLayout collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo}>
      <div>slqdmlkmsdk</div>
    </TgUsdRecordLayout>
  )
}
