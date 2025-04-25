"use client"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import DisplayReceivePanel from "@/components/design_system/inputs/display_recieve_panel"
import { ExistingAsset } from "@/types"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { useTgUsdLiquidateContext } from "./tg_usd_record_liquidate_context"
import { formatBigInt } from "@/lib/number_formatter"

export default function TgUsdLiquidatePanelFull() {
  const { tgUSDInfo, collateralInfo, marketData } = useTgUsdRecordContext()

  const { isQuoteLoading, tgUSDReceivedValue } = useTgUsdLiquidateContext()

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

  const WithdrawAssetDisplay = () => {
    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <div className="">
          <TokenImage token={collateralInfo?.logo} size={32} />
        </div>
        <span className="flex flex-col text-lg leading-3">
          <span>{collateralInfo.symbol}</span>
        </span>
      </PanelRaw>
    )
  }

  return (
    <>
      <div className="flex w-full items-end justify-between">
        <span className="text-[20px] font-bold">Liquidate all</span>
      </div>

      <div className="flex flex-col gap-2">
        <DepositInput
          depositAmount={marketData?.collateralInfos?.positionCollateralAmount}
          labelDeposit="You liquidate"
          depositSelect={<WithdrawAssetDisplay />}
          disabled={true}
          displaySliderInput={false}
          depositAsset={collateralInfo}
          setMaxBalance={() => {}}
          onValueChange={() => {}}
          displayBalance={false}
          isLoading={isQuoteLoading}
        />

        <DisplayReceivePanel
          labelReceive="You receive"
          receiveAmount={formatBigInt(tgUSDReceivedValue, 18, 2) || "0"}
          receiveAssetDisplay={<AssetDisplay logo={tgUSDInfo.logo!} symbol={tgUSDInfo.symbol} />}
          receiveDollarValue={formatBigInt(tgUSDReceivedValue, 18, 2) || "0"}
        />
      </div>
    </>
  )
}
