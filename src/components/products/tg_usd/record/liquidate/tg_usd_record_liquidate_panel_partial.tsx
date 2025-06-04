"use client"

import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { useTgUsdLiquidateContext } from "./tg_usd_record_liquidate_context"
import TokenImage from "@/components/design_system/structure/token_image"
import Divider from "@/components/design_system/structure/divider"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { formatBigInt } from "@/lib/number_formatter"

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

  const LiquidateAssetDisplay = () => {
    return (
      <div className="flex items-center gap-2 rounded-[10px] border border-white border-opacity-20 bg-select-input px-3 py-2">
        <TokenImage token={collateralInfo?.logo} size={20} />

        <span className="flex flex-col text-sm font-bold">
          <span>{collateralInfo.symbol}</span>
        </span>
      </div>
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
        depositSelect={<LiquidateAssetDisplay />}
        disabled={!canInteract}
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
            <TokenImage token="tgUSD" size={20} />
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
        percentage={0}
        setPercentage={() => {}}
      />

      <Divider />

      <DepositInput
        depositAmount={repayWeiValue}
        labelDeposit="You repay"
        depositSelect={
          <div className="flex items-center gap-2 rounded-[10px] border border-white border-opacity-20 bg-select-input px-3 py-2">
            <TokenImage token="tgUSD" size={20} />
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
            <TokenImage token="tgUSD" size={20} />
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
        percentage={0}
        setPercentage={() => {}}
      />
    </>
  )
}
