"use client"

import React from "react"
import TgUsdRecordLayout from "../tg_usd_record_layout"
import { AssetDataPriced, TgUsdMarketAsset } from "@/types"

import { TgUsdMarket } from "../../tg_usd_type"

import { TgUsdRecordProvider } from "../tg_usd_record_context"
import { TgUsdBorrowProvider } from "./tg_usd_record_borrow_context"
import TgUsdBorrowPanel from "./tg_usd_record_borrow_panel"

type TgUsdRecordBorrowProps = {
  collateral: TgUsdMarketAsset
  collateralInfo: AssetDataPriced
  marketInfo: TgUsdMarket
  tgUSDInfo: AssetDataPriced
}

export default function TgUsdRecordBorrowPage({ collateral, collateralInfo, marketInfo, tgUSDInfo }: TgUsdRecordBorrowProps) {
  return (
    <TgUsdRecordProvider collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo}>
      <TgUsdRecordLayout>
        <TgUsdBorrowProvider>
          <TgUsdBorrowPanel />
        </TgUsdBorrowProvider>
      </TgUsdRecordLayout>
    </TgUsdRecordProvider>
  )
}
