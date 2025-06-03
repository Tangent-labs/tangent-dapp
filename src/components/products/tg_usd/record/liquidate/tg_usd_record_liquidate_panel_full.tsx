"use client"

import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { useTgUsdLiquidateContext } from "./tg_usd_record_liquidate_context"
import TokenImage from "@/components/design_system/structure/token_image"
import Divider from "@/components/design_system/structure/divider"
import { useTgUsdRecordContext } from "../tg_usd_record_context"

export default function TgUsdLiquidatePanelFull() {
  const { tgUSDInfo, collateralInfo, marketData } = useTgUsdRecordContext()

  const { isQuoteLoading, tgUSDReceivedValue, repayWeiValue } = useTgUsdLiquidateContext()

  const LiquidateAssetDisplay = () => {
    return (
      <div className="flex items-center gap-2 rounded-[10px] border border-white border-opacity-20 bg-select-input px-3 py-2">
        <TokenImage token={collateralInfo?.logo} size={32} />

        <span className="flex flex-col text-sm font-bold">
          <span>{collateralInfo.symbol}</span>
        </span>
      </div>
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
          depositSelect={<LiquidateAssetDisplay />}
          disabled={true}
          displaySliderInput={false}
          depositAsset={collateralInfo}
          setMaxBalance={() => {}}
          onValueChange={() => {}}
          displayBalance={false}
          isLoading={isQuoteLoading}
        />

        <DepositInput
          depositAmount={tgUSDReceivedValue}
          labelDeposit="For"
          depositSelect={
            <div className="flex items-center gap-2 rounded-[10px] border border-white border-opacity-20 bg-select-input px-3 py-2">
              <TokenImage token="tgUSD" size={24} />
              <span className="flex flex-col text-[15px] font-bold">tgUSD</span>
            </div>
          }
          disabled={true}
          displaySliderInput={false}
          depositAsset={tgUSDInfo}
          setMaxBalance={() => {}}
          displayBalance={false}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
        />

        <Divider />

        <DepositInput
          depositAmount={repayWeiValue}
          labelDeposit="You repay"
          depositSelect={
            <div className="flex items-center gap-2 rounded-[10px] border border-white border-opacity-20 bg-select-input px-3 py-2">
              <TokenImage token="tgUSD" size={24} />
              <span className="flex flex-col text-[15px] font-bold">tgUSD</span>
            </div>
          }
          disabled={true}
          displaySliderInput={false}
          depositAsset={tgUSDInfo}
          setMaxBalance={() => {}}
          displayBalance={false}
          onValueChange={() => {}}
        />

        <DepositInput
          depositAmount={(tgUSDReceivedValue || 0n) - (repayWeiValue || 0n)}
          labelDeposit="You receive"
          depositSelect={
            <div className="flex items-center gap-2 rounded-[10px] border border-white border-opacity-20 bg-select-input px-3 py-2">
              <TokenImage token="tgUSD" size={24} />
              <span className="flex flex-col text-[15px] font-bold">tgUSD</span>
            </div>
          }
          disabled={true}
          displaySliderInput={false}
          depositAsset={tgUSDInfo}
          setMaxBalance={() => {}}
          displayBalance={false}
          onValueChange={() => {}}
          isLoading={isQuoteLoading}
        />
      </div>
    </>
  )
}
