"use client"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { useTgUsdLiquidateContext } from "./tg_usd_record_liquidate_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { formatBigInt } from "@/lib/number_formatter"
import Divider from "@/components/design_system/structure/divider"

export default function TgUsdLiquidatePanelPartial() {
  const { tgUSDInfo, collateralInfo } = useTgUsdRecordContext()

  const { canInteract } = useWalletConnexionContext()

  const {
    setRepayWeiValue,
    setLiquidablePercentage,
    handleLiquidateValueChange,
    setRepayablePercentage,
    liquidateWeiValue,
    maxLiquidable,
    liquidablePercentage,
    isQuoteLoading,
    tgUSDReceivedValue,
    repayWeiValue,
    repayablePercentage,
    maxRepayable,
  } = useTgUsdLiquidateContext()

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
        <span className="text-[20px] font-bold">Liquidate partial</span>
        <span className="text-xs text-subtitle">
          Max: {formatBigInt(maxLiquidable, 18, 2)} {collateralInfo?.symbol}
        </span>
      </div>

      <DepositInput
        depositAmount={liquidateWeiValue}
        labelDeposit="You liquidate"
        depositSelect={<WithdrawAssetDisplay />}
        disabled={!canInteract || isQuoteLoading}
        displaySliderInput={true}
        percentage={liquidablePercentage}
        setPercentage={setLiquidablePercentage}
        depositAsset={collateralInfo}
        setMaxBalance={() => {}}
        balance={maxLiquidable}
        displayBalance={false}
        onValueChange={handleLiquidateValueChange}
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
        disabled={!canInteract}
        displaySliderInput={true}
        percentage={repayablePercentage}
        setPercentage={setRepayablePercentage}
        depositAsset={tgUSDInfo}
        setMaxBalance={() => {}}
        balance={maxRepayable}
        displayBalance={false}
        onValueChange={(value: bigint | undefined) => {
          setRepayWeiValue(value)
        }}
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
    </>
  )
}
