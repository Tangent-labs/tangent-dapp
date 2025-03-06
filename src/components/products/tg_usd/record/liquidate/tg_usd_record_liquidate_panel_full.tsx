"use client"

import React from "react"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import DisplayReceivePanel from "@/components/design_system/inputs/display_recieve_panel"
import { ExistingAsset } from "@/types"

export default function TgUsdLiquidatePanelFull() {
  const { tgUSDInfo, collateralInfo } = useTgUsdRecordContext()

  const AssetDisplay = ({ logo, symbol }: { logo: ExistingAsset; symbol: string }) => {
    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <div className="">
          <TokenImage token={logo} size={32} />
        </div>
        <span className="flex flex-col text-lg leading-3">
          <span>{symbol}</span>
        </span>
      </PanelRaw>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-2xl">Liquidate all</span>
      </div>

      <div className="flex flex-col gap-2">
        <DisplayReceivePanel
          labelReceive={"you liquidate"}
          receiveAmount={0}
          receiveAssetDisplay={<AssetDisplay logo={collateralInfo.logo!} symbol={collateralInfo.symbol} />}
          receiveDollarValue={0}
        />
        <DisplayReceivePanel
          labelReceive="You recieve"
          receiveAmount={0}
          receiveAssetDisplay={<AssetDisplay logo={tgUSDInfo.logo!} symbol={tgUSDInfo.symbol} />}
          receiveDollarValue={0}
        />
      </div>
    </>
  )
}
